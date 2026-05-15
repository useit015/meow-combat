import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;
const PAUSE_PANEL = { x: 326, y: 132, width: 372, height: 314 };

function parseArgs(argv) {
  const args = {
    url: process.env.SMOKE_URL || "http://127.0.0.1:4173/",
    outDir: "output/web-game/meowtal-touch-ergonomics",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--url" && next) {
      args.url = next;
      i += 1;
    } else if (arg === "--out-dir" && next) {
      args.outDir = next;
      i += 1;
    }
  }

  return args;
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    const moduleDir = process.env.PLAYWRIGHT_NODE_MODULES;
    if (moduleDir) {
      const require = createRequire(import.meta.url);
      try {
        return require(path.join(moduleDir, "playwright"));
      } catch (fallbackError) {
        throw new Error(
          `Unable to load Playwright from PLAYWRIGHT_NODE_MODULES=${moduleDir}. ` +
            "Install playwright there or unset PLAYWRIGHT_NODE_MODULES to use a project-local install.",
          { cause: fallbackError },
        );
      }
    }

    throw new Error(
      [
        "Playwright is required for npm run smoke:meowtal.",
        "Install it outside the repo with: npm install --prefix /tmp/meowtal-playwright playwright@1.60.0",
        "Then run with: PLAYWRIGHT_NODE_MODULES=/tmp/meowtal-playwright/node_modules npm run smoke:meowtal -- --url http://127.0.0.1:4173/",
      ].join("\n"),
      { cause: error },
    );
  }
}

async function waitFrames(page, frames) {
  await page.evaluate(async (count) => {
    const step = typeof window.advanceTime === "function" ? window.advanceTime : null;
    for (let i = 0; i < count; i += 1) {
      if (step) {
        await step(1000 / 60);
      } else {
        await new Promise((resolve) => window.requestAnimationFrame(resolve));
      }
    }
  }, frames);
}

async function readState(page) {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== "function") return null;
    return window.render_game_to_text();
  });
  if (!raw) throw new Error("render_game_to_text is unavailable");
  return JSON.parse(raw);
}

async function canvasBox(page) {
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("canvas is unavailable");
  return box;
}

function pointForZone(box, zone) {
  return {
    x: box.x + ((zone.x + zone.width / 2) / GAME_WIDTH) * box.width,
    y: box.y + ((zone.y + zone.height / 2) / GAME_HEIGHT) * box.height,
  };
}

async function currentZone(page, controlId) {
  const state = await readState(page);
  const zone = state.touchControls?.zones?.find((candidate) => candidate.id === controlId);
  if (!zone) throw new Error(`touch zone ${controlId} is not visible in ${state.shellPhase ?? "unknown"}`);
  return zone;
}

async function tapControl(page, controlId) {
  const zone = await currentZone(page, controlId);
  const box = await canvasBox(page);
  const point = pointForZone(box, zone);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await waitFrames(page, 2);
  await page.mouse.up();
  await waitFrames(page, 6);
}

async function holdControl(page, controlId, frames) {
  const zone = await currentZone(page, controlId);
  const box = await canvasBox(page);
  const point = pointForZone(box, zone);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await waitFrames(page, frames);
  const state = await readState(page);
  await page.mouse.up();
  await waitFrames(page, 4);
  return state;
}

async function pressKey(page, key, frames = 2) {
  await page.keyboard.down(key);
  await waitFrames(page, frames);
  await page.keyboard.up(key);
  await waitFrames(page, 6);
}

function assert(condition, failures, message) {
  if (!condition) failures.push(message);
}

function zonesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function missingRuntimeUi(state) {
  return state.runtimeUi?.missing?.map((asset) => asset.id ?? asset.key ?? String(asset)) ?? [];
}

async function checkTouchReadability(page, state, scenario, failures) {
  const box = await canvasBox(page);
  const zones = state.touchControls?.zones ?? [];
  const targetZones = zones.filter((zone) => zone.group !== "system");
  const minTarget = scenario === "portrait" ? 30 : 42;

  for (const zone of targetZones) {
    const cssWidth = (zone.width / GAME_WIDTH) * box.width;
    const cssHeight = (zone.height / GAME_HEIGHT) * box.height;
    assert(
      Math.min(cssWidth, cssHeight) >= minTarget,
      failures,
      `${scenario}:${zone.id} touch target is too small (${cssWidth.toFixed(1)}x${cssHeight.toFixed(1)} CSS px)`,
    );
    assert(zone.y + zone.height <= 554, failures, `${scenario}:${zone.id} intrudes into the bottom safe edge`);
  }
}

async function checkCanvasFraming(page, scenario, failures) {
  const box = await canvasBox(page);
  const viewport = page.viewportSize();
  if (!viewport) return;

  if (scenario === "portrait") {
    const topGap = box.y;
    const bottomGap = viewport.height - box.y - box.height;
    const centerDelta = Math.abs(box.y + box.height / 2 - viewport.height / 2);
    assert(
      centerDelta <= viewport.height * 0.12,
      failures,
      `${scenario} canvas is vertically off-center by ${centerDelta.toFixed(1)} CSS px`,
    );
    assert(
      Math.abs(topGap - bottomGap) <= viewport.height * 0.2,
      failures,
      `${scenario} canvas gaps are unbalanced (${topGap.toFixed(1)} top vs ${bottomGap.toFixed(1)} bottom CSS px)`,
    );
  }

  if (scenario === "landscape") {
    assert(box.height >= viewport.height * 0.96, failures, `${scenario} canvas should fill the vertical play area`);
  }
}

function checkPauseReadability(state, scenario, failures) {
  const overlapping = state.touchControls?.zones?.filter((zone) => zonesOverlap(zone, PAUSE_PANEL)) ?? [];
  assert(
    overlapping.length === 0,
    failures,
    `${scenario} paused touch zones overlap pause menu: ${overlapping.map((zone) => zone.id).join(", ")}`,
  );
}

function checkControlFallback(state, scenario, failures) {
  const controls = state.controls;
  assert(controls?.keyboardSupported === true, failures, `${scenario} should report keyboard support`);
  assert(typeof controls?.fallbackLine === "string", failures, `${scenario} should report a control fallback line`);
  assert(controls?.fallbackLine?.includes("GAMEPAD"), failures, `${scenario} fallback should mention gamepad status`);
  assert(controls?.fallbackLine?.includes("KEYBOARD"), failures, `${scenario} fallback should mention keyboard fallback`);
  assert(Number.isInteger(controls?.connectedGamepads), failures, `${scenario} should report connected gamepad count`);
}

async function screenshot(page, outDir, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function openScenario(browser, url, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    deviceScaleFactor: scenario.deviceScaleFactor ?? 1,
    hasTouch: scenario.hasTouch ?? false,
    isMobile: scenario.isMobile ?? false,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push({ type: "console.error", text: msg.text() });
  });
  page.on("pageerror", (error) => {
    errors.push({ type: "pageerror", text: String(error) });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator("canvas").waitFor({ state: "visible", timeout: 10000 });
  await waitFrames(page, 18);

  return { context, page, errors };
}

async function runDesktop(browser, url, outDir) {
  const failures = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport: { width: 1024, height: 576 },
  });

  await pressKey(page, "Enter");
  await pressKey(page, "Enter");
  await waitFrames(page, 52);
  await page.keyboard.down("KeyJ");
  await waitFrames(page, 8);
  const state = await readState(page);
  await page.keyboard.up("KeyJ");

  const shot = await screenshot(page, outDir, "desktop-keyboard-fight");
  assert(state.touchControls?.visible === false, failures, "desktop should not show touch controls");
  checkControlFallback(state, "desktop", failures);
  assert(state.shellPhase === "fighting", failures, `desktop expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "lightAttack", failures, `desktop J expected lightAttack, got ${state.fighters?.p1?.state}`);
  assert(missingRuntimeUi(state).length === 0, failures, `desktop missing runtime UI: ${missingRuntimeUi(state).join(", ")}`);
  assert(errors.length === 0, failures, `desktop console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return { name: "desktop", failures, errors, screenshot: shot, state };
}

async function runMobile(browser, url, outDir, name, viewport, expectedLayout) {
  const failures = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport,
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  const readyShot = await screenshot(page, outDir, `${name}-ready`);
  await tapControl(page, "start");
  await tapControl(page, "start");
  let state = await readState(page);
  const fightShot = await screenshot(page, outDir, `${name}-fight`);

  assert(state.shellPhase === "fighting", failures, `${name} expected fighting phase, got ${state.shellPhase}`);
  assert(state.touchControls?.visible === true, failures, `${name} should show touch controls`);
  assert(state.touchControls?.layout === expectedLayout, failures, `${name} expected ${expectedLayout}, got ${state.touchControls?.layout}`);
  checkControlFallback(state, name, failures);
  await checkTouchReadability(page, state, name, failures);
  await checkCanvasFraming(page, name, failures);

  state = await holdControl(page, "right", 10);
  const rightShot = await screenshot(page, outDir, `${name}-hold-right`);
  assert(state.touchControls?.activeIds?.includes("right"), failures, `${name} right hold did not report active right`);
  assert(["walkForward", "runForward"].includes(state.fighters?.p1?.state), failures, `${name} right hold state ${state.fighters?.p1?.state}`);

  state = await holdControl(page, "special", 10);
  const specialShot = await screenshot(page, outDir, `${name}-hold-special`);
  assert(state.touchControls?.activeIds?.includes("special"), failures, `${name} special hold did not report active special`);
  assert(state.fighters?.p1?.state === "specialAttack", failures, `${name} special expected specialAttack, got ${state.fighters?.p1?.state}`);

  state = await holdControl(page, "guard", 8);
  const guardShot = await screenshot(page, outDir, `${name}-hold-guard`);
  assert(state.touchControls?.activeIds?.includes("guard"), failures, `${name} guard hold did not report active guard`);

  await tapControl(page, "pause");
  state = await readState(page);
  const pauseShot = await screenshot(page, outDir, `${name}-pause`);
  assert(state.shellPhase === "paused", failures, `${name} pause expected paused phase, got ${state.shellPhase}`);
  checkPauseReadability(state, name, failures);

  await tapControl(page, "reset");
  state = await readState(page);
  assert(state.shellPhase === "ready", failures, `${name} reset expected ready phase, got ${state.shellPhase}`);
  assert(missingRuntimeUi(state).length === 0, failures, `${name} missing runtime UI: ${missingRuntimeUi(state).join(", ")}`);
  assert(errors.length === 0, failures, `${name} console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return {
    name,
    failures,
    errors,
    screenshots: [readyShot, fightShot, rightShot, specialShot, guardShot, pauseShot],
    state,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  await fs.mkdir(args.outDir, { recursive: true });

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    results.push(await runDesktop(browser, args.url, args.outDir));
    results.push(await runMobile(browser, args.url, args.outDir, "portrait", { width: 390, height: 844 }, "phone-portrait"));
    results.push(await runMobile(browser, args.url, args.outDir, "landscape", { width: 844, height: 390 }, "phone-landscape"));
  } finally {
    await browser.close();
  }

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.name}: ${failure}`));
  const report = {
    url: args.url,
    outDir: args.outDir,
    failures,
    results,
  };
  await fs.writeFile(path.join(args.outDir, "report.json"), JSON.stringify(report, null, 2));
  if (failures.length) {
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
