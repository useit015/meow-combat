import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const GAME_WIDTH = 1024;
const GAME_HEIGHT = 576;
const PAUSE_PANEL = { x: 326, y: 132, width: 372, height: 314 };
const GAMEPAD_BUTTON = {
  Back: 8,
  North: 3,
  South: 0,
  Start: 9,
};
const TITLE_UI_SLOTS = ["title-logo"];
const FIGHT_UI_SLOTS = [
  "hud-frame",
  "rabbit-portrait",
  "cat-portrait",
  "health-bar-rabbit",
  "health-bar-cat",
  "super-meter",
  "timer-frame",
];

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

async function holdControlsTogether(context, page, controlIds, frames) {
  const state = await readState(page);
  const zones = state.touchControls?.zones ?? [];
  const box = await canvasBox(page);
  const touchPoints = controlIds.map((controlId, index) => {
    const zone = zones.find((candidate) => candidate.id === controlId);
    if (!zone) throw new Error(`touch zone ${controlId} is not visible in ${state.shellPhase ?? "unknown"}`);
    const point = pointForZone(box, zone);
    return { id: index + 1, x: point.x, y: point.y, radiusX: 10, radiusY: 10, force: 1 };
  });

  const cdp = await context.newCDPSession(page);
  try {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints });
    await waitFrames(page, frames);
    return await readState(page);
  } finally {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
    await waitFrames(page, 4);
  }
}

async function setMockGamepad(page, input = {}) {
  await page.evaluate(({ axes = [0, 0], buttons = {} }) => {
    const buttonList = Array.from({ length: 16 }, (_, index) => ({
      pressed: Boolean(buttons[index]),
      value: buttons[index] ? 1 : 0,
    }));
    window.__meowtalGamepads = [
      {
        id: "Codex Standard Mock Gamepad",
        index: 0,
        connected: true,
        mapping: "standard",
        axes,
        buttons: buttonList,
        timestamp: performance.now(),
      },
    ];
  }, input);
}

async function pressGamepadButton(page, buttonIndex, frames = 2) {
  await setMockGamepad(page, { buttons: { [buttonIndex]: true } });
  await waitFrames(page, frames);
  await setMockGamepad(page);
  await waitFrames(page, 6);
}

async function holdGamepadInput(page, input, frames) {
  await setMockGamepad(page, input);
  await waitFrames(page, frames);
  const state = await readState(page);
  await setMockGamepad(page);
  await waitFrames(page, 4);
  return state;
}

async function pressKey(page, key, frames = 2) {
  await page.keyboard.down(key);
  await waitFrames(page, frames);
  await page.keyboard.up(key);
  await waitFrames(page, 6);
}

async function holdKey(page, key, frames) {
  await page.keyboard.down(key);
  await waitFrames(page, frames);
  const state = await readState(page);
  await page.keyboard.up(key);
  await waitFrames(page, 4);
  return state;
}

function assert(condition, failures, message) {
  if (!condition) failures.push(message);
}

function zonesOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function missingRuntimeUi(state) {
  const assets = state.runtimeUi?.assets;
  if (!Array.isArray(assets)) return ["runtime-ui-state"];
  return assets.filter((asset) => asset.loaded !== true).map((asset) => asset.id ?? asset.key ?? String(asset));
}

function visibleRuntimeUiSlots(state) {
  return Array.isArray(state.runtimeUi?.visibleSlots) ? state.runtimeUi.visibleSlots : [];
}

function checkRuntimeUiLoaded(state, scenario, failures) {
  const missing = missingRuntimeUi(state);
  assert(state.runtimeUi?.allLoaded === true, failures, `${scenario} runtime UI should report allLoaded=true`);
  assert(missing.length === 0, failures, `${scenario} missing runtime UI: ${missing.join(", ")}`);
}

function checkVisibleRuntimeUiSlots(state, scenario, expectedSlots, failures) {
  const visibleSlots = visibleRuntimeUiSlots(state);
  const missing = expectedSlots.filter((slot) => !visibleSlots.includes(slot));
  assert(missing.length === 0, failures, `${scenario} hidden runtime UI slots: ${missing.join(", ")}`);
  if (state.runtimeUi?.overlaySlot) {
    assert(
      visibleSlots.includes(state.runtimeUi.overlaySlot),
      failures,
      `${scenario} overlay ${state.runtimeUi.overlaySlot} is not visible`,
    );
  }
}

function checkOnlyRuntimeUiSlots(state, scenario, expectedSlots, failures) {
  checkVisibleRuntimeUiSlots(state, scenario, expectedSlots, failures);
  const expected = new Set(expectedSlots);
  const unexpected = visibleRuntimeUiSlots(state).filter((slot) => !expected.has(slot));
  assert(unexpected.length === 0, failures, `${scenario} unexpected runtime UI slots: ${unexpected.join(", ")}`);
}

function urlWithDemo(url, demo) {
  const next = new URL(url);
  next.searchParams.set("demo", demo);
  return next.toString();
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
  if (scenario.mockGamepad) {
    await context.addInitScript(() => {
      window.__meowtalGamepads = [];
      Object.defineProperty(navigator, "getGamepads", {
        configurable: true,
        value: () => window.__meowtalGamepads,
      });
    });
  }
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

  await pressKey(page, "Space");
  let state = await holdKey(page, "Space", 10);
  assert(state.shellPhase === "fighting", failures, `desktop held Space confirm expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "idle", failures, `desktop held Space confirm should not buffer lightAttack, got ${state.fighters?.p1?.state}`);
  await waitFrames(page, 8);
  state = await holdKey(page, "Space", 10);

  const shot = await screenshot(page, outDir, "desktop-keyboard-fight");
  assert(state.touchControls?.visible === false, failures, "desktop should not show touch controls");
  checkControlFallback(state, "desktop", failures);
  assert(state.shellPhase === "fighting", failures, `desktop expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "lightAttack", failures, `desktop Space expected lightAttack, got ${state.fighters?.p1?.state}`);
  checkRuntimeUiLoaded(state, "desktop", failures);
  checkVisibleRuntimeUiSlots(state, "desktop", FIGHT_UI_SLOTS, failures);
  assert(errors.length === 0, failures, `desktop console/page errors: ${JSON.stringify(errors)}`);

  await waitFrames(page, 24);
  state = await holdKey(page, "Enter", 10);
  assert(state.shellPhase === "fighting", failures, `desktop Enter special should stay fighting, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "specialAttack", failures, `desktop Enter expected specialAttack, got ${state.fighters?.p1?.state}`);

  await context.close();
  return { name: "desktop", failures, errors, screenshot: shot, state };
}

async function runGamepad(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport: { width: 1024, height: 576 },
    mockGamepad: true,
  });

  await setMockGamepad(page);
  let state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "gamepad-ready"));
  assert(state.shellPhase === "ready", failures, `gamepad ready expected ready phase, got ${state.shellPhase}`);
  assert(state.controls?.connectedGamepads === 1, failures, `gamepad expected one connected gamepad, got ${state.controls?.connectedGamepads}`);
  assert(state.controls?.fallbackLine?.includes("1 GAMEPAD DETECTED"), failures, `gamepad fallback did not report connected pad: ${state.controls?.fallbackLine}`);
  checkRuntimeUiLoaded(state, "gamepad ready", failures);
  checkOnlyRuntimeUiSlots(state, "gamepad ready", TITLE_UI_SLOTS, failures);

  await pressGamepadButton(page, GAMEPAD_BUTTON.South);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "gamepad-select"));
  assert(state.shellPhase === "select", failures, `gamepad south confirm expected select phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, "gamepad select", failures);
  checkOnlyRuntimeUiSlots(state, "gamepad select", TITLE_UI_SLOTS, failures);

  await pressKey(page, "KeyC");
  state = await holdGamepadInput(page, { buttons: { [GAMEPAD_BUTTON.South]: true } }, 10);
  screenshots.push(await screenshot(page, outDir, "gamepad-confirm-held"));
  assert(state.shellPhase === "fighting", failures, `gamepad held south confirm expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "idle", failures, `gamepad held south confirm should not buffer lightAttack, got ${state.fighters?.p1?.state}`);
  assert(state.p2Mode === "manual", failures, `gamepad expected P2 manual after CPU toggle, got ${state.p2Mode}`);
  await waitFrames(page, 8);

  state = await holdGamepadInput(page, { buttons: { [GAMEPAD_BUTTON.South]: true } }, 10);
  screenshots.push(await screenshot(page, outDir, "gamepad-light"));
  assert(state.shellPhase === "fighting", failures, `gamepad south light should stay fighting, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "lightAttack", failures, `gamepad south expected lightAttack, got ${state.fighters?.p1?.state}`);
  await waitFrames(page, 24);

  state = await holdGamepadInput(page, { axes: [1, 0] }, 10);
  screenshots.push(await screenshot(page, outDir, "gamepad-move-right"));
  assert(state.shellPhase === "fighting", failures, `gamepad expected fighting phase, got ${state.shellPhase}`);
  assert(["walkForward", "runForward"].includes(state.fighters?.p1?.state), failures, `gamepad right axis expected movement, got ${state.fighters?.p1?.state}`);
  assert(state.fighters?.p1?.x > 300, failures, `gamepad right axis should move P1 forward, got x=${state.fighters?.p1?.x}`);

  state = await holdGamepadInput(page, { buttons: { [GAMEPAD_BUTTON.North]: true } }, 10);
  screenshots.push(await screenshot(page, outDir, "gamepad-special"));
  assert(state.shellPhase === "fighting", failures, `gamepad expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "specialAttack", failures, `gamepad special expected specialAttack, got ${state.fighters?.p1?.state}`);
  assert(state.controls?.connectedGamepads === 1, failures, "gamepad should remain connected during fight");
  checkRuntimeUiLoaded(state, "gamepad fight", failures);
  checkVisibleRuntimeUiSlots(state, "gamepad fight", FIGHT_UI_SLOTS, failures);

  await pressGamepadButton(page, GAMEPAD_BUTTON.Start);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "gamepad-pause"));
  assert(state.shellPhase === "paused", failures, `gamepad pause expected paused phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, "gamepad pause", failures);
  checkVisibleRuntimeUiSlots(state, "gamepad pause", FIGHT_UI_SLOTS, failures);

  await pressGamepadButton(page, GAMEPAD_BUTTON.Back);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "gamepad-reset"));
  assert(state.shellPhase === "ready", failures, `gamepad reset expected ready phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, "gamepad reset", failures);
  checkOnlyRuntimeUiSlots(state, "gamepad reset", TITLE_UI_SLOTS, failures);
  assert(errors.length === 0, failures, `gamepad console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return { name: "gamepad", failures, errors, screenshots, state };
}

async function runMobile(browser, url, outDir, name, viewport, expectedLayout) {
  const failures = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport,
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });

  let state = await readState(page);
  const readyShot = await screenshot(page, outDir, `${name}-ready`);
  assert(state.shellPhase === "ready", failures, `${name} ready expected ready phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, `${name} ready`, failures);
  checkOnlyRuntimeUiSlots(state, `${name} ready`, TITLE_UI_SLOTS, failures);

  await tapControl(page, "start");
  state = await readState(page);
  const selectShot = await screenshot(page, outDir, `${name}-select`);
  assert(state.shellPhase === "select", failures, `${name} select expected select phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, `${name} select`, failures);
  checkOnlyRuntimeUiSlots(state, `${name} select`, TITLE_UI_SLOTS, failures);

  await tapControl(page, "start");
  state = await readState(page);
  await pressKey(page, "KeyC");
  state = await readState(page);
  const fightShot = await screenshot(page, outDir, `${name}-fight`);

  assert(state.shellPhase === "fighting", failures, `${name} expected fighting phase, got ${state.shellPhase}`);
  assert(state.p2Mode === "manual", failures, `${name} expected manual P2 during input smoke, got ${state.p2Mode}`);
  assert(state.touchControls?.visible === true, failures, `${name} should show touch controls`);
  assert(state.touchControls?.layout === expectedLayout, failures, `${name} expected ${expectedLayout}, got ${state.touchControls?.layout}`);
  checkControlFallback(state, name, failures);
  checkRuntimeUiLoaded(state, name, failures);
  checkVisibleRuntimeUiSlots(state, name, FIGHT_UI_SLOTS, failures);
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

  state = await holdControlsTogether(context, page, ["right", "special"], 10);
  const multiTouchShot = await screenshot(page, outDir, `${name}-hold-right-special`);
  assert(state.touchControls?.activeIds?.includes("right"), failures, `${name} multi-touch did not report active right`);
  assert(state.touchControls?.activeIds?.includes("special"), failures, `${name} multi-touch did not report active special`);
  assert(state.fighters?.p1?.state === "specialAttack", failures, `${name} multi-touch special expected specialAttack, got ${state.fighters?.p1?.state}`);

  await tapControl(page, "pause");
  state = await readState(page);
  const pauseShot = await screenshot(page, outDir, `${name}-pause`);
  assert(state.shellPhase === "paused", failures, `${name} pause expected paused phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, `${name} pause`, failures);
  checkVisibleRuntimeUiSlots(state, `${name} pause`, FIGHT_UI_SLOTS, failures);
  checkPauseReadability(state, name, failures);

  await tapControl(page, "cpu");
  state = await readState(page);
  const pauseCpuShot = await screenshot(page, outDir, `${name}-pause-cpu`);
  assert(state.shellPhase === "paused", failures, `${name} CPU touch should stay paused, got ${state.shellPhase}`);
  assert(state.p2Mode === "cpu", failures, `${name} CPU touch expected P2 CPU, got ${state.p2Mode}`);

  await tapControl(page, "difficulty");
  state = await readState(page);
  const pauseDifficultyShot = await screenshot(page, outDir, `${name}-pause-difficulty`);
  assert(state.shellPhase === "paused", failures, `${name} difficulty touch should stay paused, got ${state.shellPhase}`);
  assert(state.cpuDifficulty === "hard", failures, `${name} difficulty touch expected hard, got ${state.cpuDifficulty}`);

  await tapControl(page, "reset");
  state = await readState(page);
  assert(state.shellPhase === "ready", failures, `${name} reset expected ready phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, `${name} reset`, failures);
  checkOnlyRuntimeUiSlots(state, `${name} reset`, TITLE_UI_SLOTS, failures);
  assert(errors.length === 0, failures, `${name} console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return {
    name,
    failures,
    errors,
    screenshots: [
      readyShot,
      selectShot,
      fightShot,
      rightShot,
      specialShot,
      guardShot,
      multiTouchShot,
      pauseShot,
      pauseCpuShot,
      pauseDifficultyShot,
    ],
    state,
  };
}

async function runRollDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const states = {};

  for (const [demo, expectedState] of [
    ["roll-forward", "rollForward"],
    ["roll-back", "rollBack"],
  ]) {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, demo), {
      viewport: { width: 1024, height: 576 },
    });
    const state = await readState(page);
    const shot = await screenshot(page, outDir, demo);
    screenshots.push(shot);
    states[demo] = state;

    assert(state.shellPhase === "fighting", failures, `${demo} expected fighting phase, got ${state.shellPhase}`);
    assert(state.fighters?.p1?.state === expectedState, failures, `${demo} expected ${expectedState}, got ${state.fighters?.p1?.state}`);
    assert(state.fighters?.p1?.guarding === false, failures, `${demo} should not overlap guard with roll`);
    assert(
      state.runtimeVisuals?.p1?.animationId === "crouch",
      failures,
      `${demo} should reuse approved crouch row for character-consistent roll readability`,
    );
    checkRuntimeUiLoaded(state, demo, failures);
    checkVisibleRuntimeUiSlots(state, demo, FIGHT_UI_SLOTS, failures);
    assert(errors.length === 0, failures, `${demo} console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  return { name: "roll-demo", failures, errors: [], screenshots, states };
}

async function runEndgameDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const states = {};

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "ko"), {
      viewport: { width: 1024, height: 576 },
    });
    let state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "ko-overlay"));
    states["ko-overlay"] = state;
    assert(state.shellPhase === "round-over", failures, `ko expected round-over phase, got ${state.shellPhase}`);
    assert(state.runtimeUi?.overlaySlot === "ko-overlay", failures, `ko expected ko-overlay, got ${state.runtimeUi?.overlaySlot}`);
    assert(state.fighters?.p2?.state === "knockdown", failures, `ko expected p2 knockdown, got ${state.fighters?.p2?.state}`);
    checkRuntimeUiLoaded(state, "ko", failures);
    checkVisibleRuntimeUiSlots(state, "ko", [...FIGHT_UI_SLOTS, "ko-overlay"], failures);

    await waitFrames(page, 42);
    state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "round-victory-overlay"));
    states["round-victory-overlay"] = state;
    assert(
      state.runtimeUi?.overlaySlot === "rabbit-win-overlay",
      failures,
      `round victory expected rabbit-win-overlay, got ${state.runtimeUi?.overlaySlot}`,
    );
    checkRuntimeUiLoaded(state, "round victory", failures);
    checkVisibleRuntimeUiSlots(state, "round victory", [...FIGHT_UI_SLOTS, "rabbit-win-overlay"], failures);
    assert(errors.length === 0, failures, `ko console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "win"), {
      viewport: { width: 1024, height: 576 },
    });
    let state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "match-victory-overlay"));
    states["match-victory-overlay"] = state;
    assert(state.shellPhase === "match-over", failures, `win expected match-over phase, got ${state.shellPhase}`);
    assert(state.matchSet?.status === "complete", failures, `win expected complete match set, got ${state.matchSet?.status}`);
    assert(
      state.runtimeUi?.overlaySlot === "rabbit-win-overlay",
      failures,
      `win expected rabbit-win-overlay, got ${state.runtimeUi?.overlaySlot}`,
    );
    assert(state.runtimeVisuals?.p1?.animationId === "win", failures, `win expected p1 win row, got ${state.runtimeVisuals?.p1?.animationId}`);
    assert(state.runtimeVisuals?.p2?.animationId === "lose", failures, `win expected p2 lose row, got ${state.runtimeVisuals?.p2?.animationId}`);
    checkRuntimeUiLoaded(state, "win", failures);
    checkVisibleRuntimeUiSlots(state, "win", [...FIGHT_UI_SLOTS, "rabbit-win-overlay"], failures);

    await pressKey(page, "Enter");
    state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "rematch-fighting"));
    states["rematch-fighting"] = state;
    assert(state.shellPhase === "fighting", failures, `rematch expected fighting phase, got ${state.shellPhase}`);
    assert(state.matchSet?.status === "in-progress", failures, `rematch expected in-progress set, got ${state.matchSet?.status}`);
    assert(state.matchSet?.wins?.p1 === 0 && state.matchSet?.wins?.p2 === 0, failures, "rematch should clear match wins");
    assert(state.fighters?.p1?.health === 1000 && state.fighters?.p2?.health === 1000, failures, "rematch should reset fighter health");
    checkRuntimeUiLoaded(state, "rematch", failures);
    checkVisibleRuntimeUiSlots(state, "rematch", FIGHT_UI_SLOTS, failures);

    await pressKey(page, "KeyR");
    state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "reset-ready"));
    states["reset-ready"] = state;
    assert(state.shellPhase === "ready", failures, `reset expected ready phase, got ${state.shellPhase}`);
    checkRuntimeUiLoaded(state, "reset", failures);
    checkOnlyRuntimeUiSlots(state, "reset", TITLE_UI_SLOTS, failures);
    assert(errors.length === 0, failures, `win/rematch console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "cat-win"), {
      viewport: { width: 1024, height: 576 },
    });
    const state = await readState(page);
    screenshots.push(await screenshot(page, outDir, "cat-victory-overlay"));
    states["cat-victory-overlay"] = state;
    assert(state.shellPhase === "match-over", failures, `cat-win expected match-over phase, got ${state.shellPhase}`);
    assert(
      state.runtimeUi?.overlaySlot === "cat-win-overlay",
      failures,
      `cat-win expected cat-win-overlay, got ${state.runtimeUi?.overlaySlot}`,
    );
    assert(state.runtimeVisuals?.p1?.animationId === "lose", failures, `cat-win expected p1 lose row, got ${state.runtimeVisuals?.p1?.animationId}`);
    assert(state.runtimeVisuals?.p2?.animationId === "win", failures, `cat-win expected p2 win row, got ${state.runtimeVisuals?.p2?.animationId}`);
    checkRuntimeUiLoaded(state, "cat-win", failures);
    checkVisibleRuntimeUiSlots(state, "cat-win", [...FIGHT_UI_SLOTS, "cat-win-overlay"], failures);
    assert(errors.length === 0, failures, `cat-win console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  return { name: "endgame-demo", failures, errors: [], screenshots, states };
}

async function main() {
  const args = parseArgs(process.argv);
  await fs.mkdir(args.outDir, { recursive: true });

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    results.push(await runDesktop(browser, args.url, args.outDir));
    results.push(await runGamepad(browser, args.url, args.outDir));
    results.push(await runRollDemo(browser, args.url, args.outDir));
    results.push(await runEndgameDemo(browser, args.url, args.outDir));
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
