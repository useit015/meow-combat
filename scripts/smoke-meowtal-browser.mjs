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
const CORE_FIGHT_UI_SLOTS = [
  "hud-frame",
  "health-bar-rabbit",
  "health-bar-cat",
  "super-meter",
  "timer-frame",
];
const FIGHT_UI_SLOTS = [...CORE_FIGHT_UI_SLOTS, "rabbit-portrait", "cat-portrait"];
const EXPECTED_RUNTIME_ROSTER_IDS = ["gray-rabbit", "ginger-tabby-cat", "pugilist-pug", "ferret-noodle"];
const EXPECTED_RUNTIME_PLAYABLE_COUNT = EXPECTED_RUNTIME_ROSTER_IDS.length;
const EXPECTED_PLANNED_LOCKED_COUNT = 4;
const EXPECTED_ROSTER_TRUTH =
  `${EXPECTED_RUNTIME_PLAYABLE_COUNT} playable runtime fighters; ` +
  `${EXPECTED_PLANNED_LOCKED_COUNT} planned locked for model-sheet QA`;
const NOODLE_RUNTIME_ROWS = [
  "idle",
  "walk-forward",
  "walk-back",
  "crouch",
  "jump",
  "light-punch",
  "heavy-punch",
  "light-kick",
  "special",
  "hitstun",
  "blockstun",
  "knockdown",
  "win",
  "lose",
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

async function waitRealFrames(page, frames) {
  await page.evaluate(async (count) => {
    for (let i = 0; i < count; i += 1) {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
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

async function sampleFramePacing(page, frames = 20) {
  await waitRealFrames(page, frames);
  return readState(page);
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

async function selectRosterPair(page, { p1Index, p2Index }) {
  for (let index = 0; index < p1Index; index += 1) {
    await pressKey(page, "KeyD");
  }
  const p2Steps =
    (p2Index - 1 + EXPECTED_RUNTIME_PLAYABLE_COUNT) % EXPECTED_RUNTIME_PLAYABLE_COUNT;
  for (let index = 0; index < p2Steps; index += 1) {
    await pressKey(page, "ArrowRight");
  }
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

function visibleShellCopy(state) {
  const copy = state.shellPresentation?.visibleCopy ?? {};
  return Object.values(copy)
    .filter((value) => typeof value === "string")
    .join("\n");
}

function checkKeyboardShellPresentation(state, scenario, failures) {
  const shell = state.shellPresentation;
  assert(shell?.keyboardFirst === true, failures, `${scenario} should expose keyboard-first shell presentation`);
  assert(shell?.orientation === "landscape", failures, `${scenario} should expose landscape browser v1 orientation`);
  assert(shell?.touchPlan === "mobile-v2", failures, `${scenario} should keep touch as mobile v2 plan`);
  assert(
    !visibleShellCopy(state).includes("PHONE TOUCH"),
    failures,
    `${scenario} visible shell copy should not present phone touch as browser v1`,
  );
}

function checkModeShellPresentation(state, scenario, expectedMode, expectedLabel, expectedFragment, failures) {
  checkKeyboardShellPresentation(state, scenario, failures);
  assert(state.shellPresentation?.mode?.id === expectedMode, failures, `${scenario} expected mode ${expectedMode}`);
  assert(state.shellPresentation?.mode?.label === expectedLabel, failures, `${scenario} expected label ${expectedLabel}`);
  assert(
    state.shellPresentation?.mode?.status === "implemented",
    failures,
    `${scenario} should only expose implemented browser v1 modes`,
  );
  assert(
    state.shellPresentation?.mode?.description?.includes(expectedFragment) ||
      state.shellPresentation?.mode?.purpose?.includes(expectedFragment),
    failures,
    `${scenario} mode presentation should include ${expectedFragment}`,
  );
  assert(
    state.shellPresentation?.mode?.panelLines?.includes(expectedLabel),
    failures,
    `${scenario} mode panel should include ${expectedLabel}`,
  );
}

function checkSelectShellPresentation(state, scenario, failures) {
  checkKeyboardShellPresentation(state, scenario, failures);
  const shell = state.shellPresentation;
  assert(
    shell?.roster?.playableCount === EXPECTED_RUNTIME_PLAYABLE_COUNT,
    failures,
    `${scenario} should expose exactly ${EXPECTED_RUNTIME_PLAYABLE_COUNT} playable runtime fighters`,
  );
  assert(
    shell?.roster?.plannedLockedCount === EXPECTED_PLANNED_LOCKED_COUNT,
    failures,
    `${scenario} should expose ${EXPECTED_PLANNED_LOCKED_COUNT} planned locked fighters`,
  );
  assert(shell?.roster?.plannedFightersPlayable === false, failures, `${scenario} should not claim planned fighters are playable`);
  assert(
    shell?.roster?.truthLine?.includes(`${EXPECTED_RUNTIME_PLAYABLE_COUNT} PLAYABLE NOW`),
    failures,
    `${scenario} roster truth should name playable count`,
  );
  assert(
    shell?.roster?.truthLine?.includes(`${EXPECTED_PLANNED_LOCKED_COUNT} PLANNED LOCKED`),
    failures,
    `${scenario} roster truth should name planned locked count`,
  );
  assert(
    !visibleShellCopy(state).includes(`${EXPECTED_RUNTIME_PLAYABLE_COUNT + EXPECTED_PLANNED_LOCKED_COUNT} PLAYABLE`),
    failures,
    `${scenario} shell copy should not overclaim planned fighters`,
  );

  for (const player of ["p1", "p2"]) {
    const card = shell?.selectedFighters?.[player];
    assert(typeof card?.leagueName === "string" && card.leagueName.length > 0, failures, `${scenario} ${player} should expose league name`);
    assert(typeof card?.storyHook === "string" && card.storyHook.length > 0, failures, `${scenario} ${player} should expose story hook`);
    assert(typeof card?.signatureMove === "string" && card.signatureMove.length > 0, failures, `${scenario} ${player} should expose signature move`);
    assert(typeof card?.superMove === "string" && card.superMove.length > 0, failures, `${scenario} ${player} should expose super move`);
  }
}

function checkPauseShellPresentation(state, scenario, failures) {
  checkKeyboardShellPresentation(state, scenario, failures);
  assert(state.shellPresentation?.phase === "paused", failures, `${scenario} shell presentation should report paused`);
  assert(
    visibleShellCopy(state).includes("START / P / ESC RESUME"),
    failures,
    `${scenario} pause copy should expose resume controls`,
  );
  assert(
    visibleShellCopy(state).includes("BROWSER OPTIONS"),
    failures,
    `${scenario} pause copy should expose browser options`,
  );
  assert(state.browserSettings?.visible === true, failures, `${scenario} should expose visible browser settings state`);
  assert(
    state.browserSettings?.surface === "browser-v1-options",
    failures,
    `${scenario} should expose browser-v1-options surface`,
  );
  assert(state.browserSettings?.keyboardFirst === true, failures, `${scenario} settings should be keyboard-first`);
  assert(state.browserSettings?.orientation === "landscape", failures, `${scenario} settings should report landscape orientation`);
  assert(
    state.shellPresentation?.settings?.surface === "browser-v1-options",
    failures,
    `${scenario} shell presentation should include settings state`,
  );
  assert(state.shellPresentation?.actions?.includes("R reset"), failures, `${scenario} pause actions should include reset`);
}

function checkEndShellPresentation(state, scenario, expectedAction, failures) {
  checkKeyboardShellPresentation(state, scenario, failures);
  assert(
    state.shellPresentation?.actions?.includes(expectedAction),
    failures,
    `${scenario} shell presentation should include ${expectedAction}`,
  );
  assert(visibleShellCopy(state).includes("ENTER / SPACE"), failures, `${scenario} end copy should expose Enter/Space`);
}

function checkChampionshipRewardInterstitial(state, scenario, expectedKind, expectedRewardStatus, expectedProgress, failures) {
  const presentation = state.storyMode?.presentation;
  const interstitial = presentation?.interstitial;
  const reward = presentation?.reward;

  assert(interstitial?.kind === expectedKind, failures, `${scenario} expected ${expectedKind} interstitial, got ${interstitial?.kind}`);
  assert(
    reward?.status === expectedRewardStatus,
    failures,
    `${scenario} expected reward status ${expectedRewardStatus}, got ${reward?.status}`,
  );
  assert(reward?.title === "Snackbelt Treat Dispenser", failures, `${scenario} should expose the Snackbelt reward`);
  assert(
    interstitial?.progressLine?.includes(expectedProgress),
    failures,
    `${scenario} progress should include ${expectedProgress}, got ${interstitial?.progressLine}`,
  );
  assert(
    interstitial?.rosterTruth === EXPECTED_ROSTER_TRUTH,
    failures,
    `${scenario} should keep roster truth in interstitial state`,
  );
  assert(interstitial?.nextAction === presentation?.callToAction, failures, `${scenario} nextAction should match CTA`);
  assert(typeof interstitial?.payoffLine === "string" && interstitial.payoffLine.length > 0, failures, `${scenario} should expose payoff flavor`);
  assert(typeof reward?.claimLine === "string" && reward.claimLine.length > 0, failures, `${scenario} should expose reward claim line`);
}

function checkFramePacing(state, scenario, failures) {
  const pacing = state.framePacing;
  assert(pacing && typeof pacing === "object", failures, `${scenario} should expose frame pacing telemetry`);
  assert(pacing?.lastRawDeltaMs > 0, failures, `${scenario} should sample real frame delta`);
  assert(pacing?.lastClampedDeltaMs <= pacing?.maxDeltaMs + 0.5, failures, `${scenario} clamped delta exceeded max`);
  assert(pacing?.lastSteps <= pacing?.maxStepsPerFrame, failures, `${scenario} exceeded max fixed steps per frame`);
  assert(pacing?.accumulatorMs >= 0 && pacing?.accumulatorMs < pacing?.maxDeltaMs, failures, `${scenario} accumulator out of bounds`);
  assert(Number.isInteger(pacing?.cappedFrameCount), failures, `${scenario} capped frame count should be an integer`);
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
  let state = await readState(page);
  assert(state.shellPhase === "mode-select", failures, `desktop Space confirm expected mode-select phase, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `desktop default play mode expected versus-cpu, got ${state.playMode}`);
  checkModeShellPresentation(state, "desktop mode-select", "versus-cpu", "1 VS CPU", "Best-of-three", failures);
  await pressKey(page, "Space");
  state = await readState(page);
  assert(state.shellPhase === "select", failures, `desktop second Space confirm expected select phase, got ${state.shellPhase}`);
  checkSelectShellPresentation(state, "desktop character-select", failures);
  state = await holdKey(page, "Space", 10);
  assert(state.shellPhase === "fighting", failures, `desktop held Space confirm expected fighting phase, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `desktop fight expected versus-cpu mode, got ${state.playMode}`);
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
  state = await sampleFramePacing(page);
  checkFramePacing(state, "desktop", failures);

  await context.close();
  return { name: "desktop", failures, errors, screenshot: shot, state };
}

async function runCombatReadabilityDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const states = {};
  const cases = [
    { demo: "combat-readability-light", shot: "combat-readability-light-hit", kind: "hit", tier: "light", label: "HIT", damageKind: "light" },
    { demo: "combat-readability-block", shot: "combat-readability-block", kind: "block", tier: "heavy", label: "HEAVY BLOCK", damageKind: null },
    { demo: "combat-readability-heavy", shot: "combat-readability-heavy-hit", kind: "hit", tier: "heavy", label: "HEAVY", damageKind: "heavy" },
    { demo: "combat-readability-special", shot: "combat-readability-special-hit", kind: "hit", tier: "special", label: "SPECIAL", damageKind: "special" },
    { demo: "combat-readability-super", shot: "combat-readability-super-hit", kind: "hit", tier: "super", label: "SUPER", damageKind: "super" },
  ];

  for (const demoCase of cases) {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, demoCase.demo), {
      viewport: { width: 1024, height: 576 },
    });
    const state = await readState(page);
    screenshots.push(await screenshot(page, outDir, demoCase.shot));
    states[demoCase.demo] = state;

    assert(state.shellPhase === "fighting", failures, `${demoCase.demo} expected fighting phase, got ${state.shellPhase}`);
    assert(state.effects?.count > 0, failures, `${demoCase.demo} expected active combat effects`);
    assert(
      state.effects?.active?.[0]?.kind === demoCase.kind,
      failures,
      `${demoCase.demo} expected ${demoCase.kind} effect, got ${state.effects?.active?.[0]?.kind}`,
    );
    assert(
      state.effects?.active?.[0]?.tier === demoCase.tier,
      failures,
      `${demoCase.demo} expected ${demoCase.tier} feedback tier, got ${state.effects?.active?.[0]?.tier}`,
    );
    assert(
      state.effects?.active?.[0]?.label === demoCase.label,
      failures,
      `${demoCase.demo} expected ${demoCase.label} feedback label, got ${state.effects?.active?.[0]?.label}`,
    );
    if (demoCase.damageKind) {
      assert(
        state.damageNumbers?.kinds?.includes(demoCase.damageKind),
        failures,
        `${demoCase.demo} expected ${demoCase.damageKind} damage number, got ${JSON.stringify(state.damageNumbers)}`,
      );
    } else {
      assert(state.damageNumbers?.count === 0, failures, `${demoCase.demo} block should not create damage numbers`);
    }
    assert(state.runtimeVisuals?.p1?.frameWidth === 256, failures, `${demoCase.demo} p1 sprite frame width changed`);
    assert(state.runtimeVisuals?.p2?.frameHeight === 256, failures, `${demoCase.demo} p2 sprite frame height changed`);
    checkRuntimeUiLoaded(state, demoCase.demo, failures);
    checkVisibleRuntimeUiSlots(state, demoCase.demo, FIGHT_UI_SLOTS, failures);
    assert(errors.length === 0, failures, `${demoCase.demo} console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  return { name: "combat-readability-demo", failures, errors: [], screenshots, states };
}

async function runTrainingDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport: { width: 1024, height: 576 },
  });

  await pressKey(page, "Space");
  let state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-mode-select-default"));
  assert(state.shellPhase === "mode-select", failures, `training path expected mode-select phase, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `training path default expected versus-cpu, got ${state.playMode}`);
  checkModeShellPresentation(state, "training default mode-select", "versus-cpu", "1 VS CPU", "Best-of-three", failures);

  await pressKey(page, "KeyD");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-mode-selected"));
  assert(state.shellPhase === "mode-select", failures, `training mode cycle should stay mode-select, got ${state.shellPhase}`);
  assert(state.playMode === "training", failures, `training mode cycle expected training, got ${state.playMode}`);
  assert(state.playModeLabel === "TRAINING", failures, `training mode label expected TRAINING, got ${state.playModeLabel}`);
  checkModeShellPresentation(state, "training mode-select", "training", "TRAINING", "combo feedback", failures);

  await pressKey(page, "Space");
  await selectRosterPair(page, { p1Index: 3, p2Index: 2 });
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-noodle-character-select"));
  assert(state.shellPhase === "select", failures, `training confirm expected select phase, got ${state.shellPhase}`);
  assert(state.playMode === "training", failures, `training select expected training mode, got ${state.playMode}`);
  checkSelectShellPresentation(state, "training character-select", failures);
  assert(
    state.selectedFighterDetails?.p1?.fighterId === "ferret-noodle",
    failures,
    `training select expected Noodle P1, got ${state.selectedFighterDetails?.p1?.fighterId}`,
  );
  assert(
    state.selectedFighterDetails?.p2?.fighterId === "pugilist-pug",
    failures,
    `training select expected Pickles dummy, got ${state.selectedFighterDetails?.p2?.fighterId}`,
  );

  await pressKey(page, "Space");
  await waitFrames(page, 30);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-noodle-fight"));
  assert(state.shellPhase === "fighting", failures, `training fight expected fighting phase, got ${state.shellPhase}`);
  assert(state.playMode === "training", failures, `training fight expected training mode, got ${state.playMode}`);
  assert(state.training?.enabled === true, failures, "training fight should expose training.enabled=true");
  assert(state.training?.endlessRound === true, failures, "training fight should expose endlessRound=true");
  assert(
    state.training?.selectedFighter?.fighterId === "ferret-noodle",
    failures,
    `training fight should expose Noodle as selected fighter, got ${state.training?.selectedFighter?.fighterId}`,
  );
  assert(
    state.training?.selectedFighter?.trainingTip?.includes("side switches"),
    failures,
    "training fight should expose Noodle side-switch training tip",
  );
  assert(
    state.training?.dummy?.behavior === "manual idle sparring dummy" && state.training?.dummy?.healthLocked === true,
    failures,
    `training dummy should expose manual health-locked behavior, got ${JSON.stringify(state.training?.dummy)}`,
  );
  assert(
    state.training?.presentation?.headline === "TRAINING LAB",
    failures,
    `training presentation expected TRAINING LAB, got ${state.training?.presentation?.headline}`,
  );
  assert(
    state.training?.presentation?.feedbackLine?.includes("0 HIT"),
    failures,
    `training presentation should expose combo feedback, got ${state.training?.presentation?.feedbackLine}`,
  );
  assert(state.p2Mode === "manual", failures, `training fight expected manual dummy, got ${state.p2Mode}`);
  assert(state.runtimeVisuals?.p1?.fighterId === "ferret-noodle", failures, `training P1 runtime expected Noodle, got ${state.runtimeVisuals?.p1?.fighterId}`);
  assert(state.runtimeVisuals?.p2?.fighterId === "pugilist-pug", failures, `training P2 runtime expected Pickles, got ${state.runtimeVisuals?.p2?.fighterId}`);
  assert(
    state.assetReadiness?.runtimeFallbacks?.fighterAnimations === 0,
    failures,
    `training Noodle expected zero fighter fallbacks, got ${state.assetReadiness?.runtimeFallbacks?.fighterAnimations}`,
  );
  checkRuntimeUiLoaded(state, "training fight", failures);
  checkVisibleRuntimeUiSlots(state, "training fight", CORE_FIGHT_UI_SLOTS, failures);
  checkHudPortrait(state, "p1", "ferret-noodle", null, "training Noodle P1", failures);
  checkHudPortrait(state, "p2", "pugilist-pug", null, "training Pickles dummy", failures);
  await checkNoodleRuntimeRowsFetched(page, "training Noodle", failures);

  await page.keyboard.down("KeyJ");
  await waitFrames(page, 5);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-noodle-light-feedback"));
  await page.keyboard.up("KeyJ");
  await waitFrames(page, 4);
  assert(
    state.training?.practice?.currentAction === "Light punch",
    failures,
    `training practice should expose current light-punch action, got ${state.training?.practice?.currentAction}`,
  );
  assert(
    state.training?.presentation?.feedbackLine?.includes("Light punch"),
    failures,
    `training presentation should include light-punch feedback, got ${state.training?.presentation?.feedbackLine}`,
  );

  await pressKey(page, "KeyR");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "training-reset-ready"));
  assert(state.shellPhase === "ready", failures, `training reset expected ready phase, got ${state.shellPhase}`);
  assert(errors.length === 0, failures, `training console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return { name: "training-demo", failures, errors, screenshots, state };
}

async function runLocalVersusDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport: { width: 1024, height: 576 },
  });

  await pressKey(page, "Space");
  for (let index = 0; index < 3; index += 1) {
    await pressKey(page, "KeyD");
  }
  let state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "local-versus-mode-selected"));
  assert(state.shellPhase === "mode-select", failures, `local versus expected mode-select phase, got ${state.shellPhase}`);
  assert(state.playMode === "local-versus", failures, `local versus mode cycle expected local-versus, got ${state.playMode}`);
  assert(state.playModeLabel === "LOCAL VERSUS", failures, `local versus label expected LOCAL VERSUS, got ${state.playModeLabel}`);
  checkModeShellPresentation(state, "local-versus mode-select", "local-versus", "LOCAL VERSUS", "Same-keyboard", failures);
  assert(
    state.shellPresentation?.mode?.panelLines?.includes("P1 VS P2 MANUAL"),
    failures,
    `local versus panel should expose manual P1/P2, got ${state.shellPresentation?.mode?.panelLines}`,
  );

  await pressKey(page, "Space");
  await selectRosterPair(page, { p1Index: 3, p2Index: 2 });
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "local-versus-noodle-pickles-select"));
  assert(state.shellPhase === "select", failures, `local versus select expected select, got ${state.shellPhase}`);
  assert(state.playMode === "local-versus", failures, `local versus select expected local-versus, got ${state.playMode}`);
  checkSelectShellPresentation(state, "local-versus character-select", failures);
  assert(
    state.selectedFighterDetails?.p1?.fighterId === "ferret-noodle",
    failures,
    `local versus select expected Noodle P1, got ${state.selectedFighterDetails?.p1?.fighterId}`,
  );
  assert(
    state.selectedFighterDetails?.p2?.fighterId === "pugilist-pug",
    failures,
    `local versus select expected Pickles P2, got ${state.selectedFighterDetails?.p2?.fighterId}`,
  );
  assert(
    state.shellPresentation?.selectedFighters?.p2?.role === "P2",
    failures,
    `local versus select should label second player P2, got ${state.shellPresentation?.selectedFighters?.p2?.role}`,
  );

  await pressKey(page, "Space");
  await waitFrames(page, 20);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "local-versus-noodle-pickles-fight"));
  assert(state.shellPhase === "fighting", failures, `local versus fight expected fighting, got ${state.shellPhase}`);
  assert(state.playMode === "local-versus", failures, `local versus fight expected local-versus, got ${state.playMode}`);
  assert(state.p2Mode === "manual", failures, `local versus fight expected manual P2, got ${state.p2Mode}`);
  assert(state.cpuOpponent === null, failures, `local versus should not expose CPU opponent, got ${JSON.stringify(state.cpuOpponent)}`);
  assert(state.localVersus?.enabled === true, failures, "local versus should expose localVersus.enabled=true");
  assert(state.localVersus?.p2Mode === "manual", failures, `local versus state expected manual P2, got ${state.localVersus?.p2Mode}`);
  assert(
    state.localVersus?.controlPlan === "same-keyboard",
    failures,
    `local versus state expected same-keyboard plan, got ${state.localVersus?.controlPlan}`,
  );
  assert(
    state.localVersus?.p1?.fighterId === "ferret-noodle" && state.localVersus?.p2?.fighterId === "pugilist-pug",
    failures,
    `local versus should expose Noodle/Pickles fighters, got ${JSON.stringify(state.localVersus)}`,
  );
  assert(
    state.localVersus?.inputHints?.p2?.some((hint) => hint.includes("Numpad")),
    failures,
    `local versus should expose P2 keyboard hints, got ${JSON.stringify(state.localVersus?.inputHints)}`,
  );
  assert(state.runtimeVisuals?.p1?.fighterId === "ferret-noodle", failures, `local versus P1 runtime expected Noodle, got ${state.runtimeVisuals?.p1?.fighterId}`);
  assert(state.runtimeVisuals?.p2?.fighterId === "pugilist-pug", failures, `local versus P2 runtime expected Pickles, got ${state.runtimeVisuals?.p2?.fighterId}`);
  assert(
    state.assetReadiness?.runtimeFallbacks?.fighterAnimations === 0,
    failures,
    `local versus Noodle expected zero fighter fallbacks, got ${state.assetReadiness?.runtimeFallbacks?.fighterAnimations}`,
  );
  checkRuntimeUiLoaded(state, "local versus fight", failures);
  checkVisibleRuntimeUiSlots(state, "local versus fight", CORE_FIGHT_UI_SLOTS, failures);
  checkHudPortrait(state, "p1", "ferret-noodle", null, "local versus Noodle P1", failures);
  checkHudPortrait(state, "p2", "pugilist-pug", null, "local versus Pickles P2", failures);
  await checkNoodleRuntimeRowsFetched(page, "local versus Noodle", failures);

  await pressKey(page, "KeyC");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "local-versus-noodle-cpu-toggle-ignored"));
  assert(state.playMode === "local-versus", failures, `local versus CPU toggle should stay local-versus, got ${state.playMode}`);
  assert(state.p2Mode === "manual", failures, `local versus CPU toggle should keep manual P2, got ${state.p2Mode}`);
  assert(state.cpuOpponent === null, failures, `local versus CPU toggle should not expose CPU opponent, got ${JSON.stringify(state.cpuOpponent)}`);
  assert(
    state.localVersus?.p2Mode === "manual",
    failures,
    `local versus CPU toggle should keep localVersus.p2Mode manual, got ${state.localVersus?.p2Mode}`,
  );

  const p2StartX = state.fighters?.p2?.x;
  state = await holdKey(page, "ArrowLeft", 12);
  screenshots.push(await screenshot(page, outDir, "local-versus-pickles-p2-move"));
  assert(state.shellPhase === "fighting", failures, `local versus P2 move expected fighting, got ${state.shellPhase}`);
  assert(state.p2Mode === "manual", failures, `local versus P2 move expected manual P2, got ${state.p2Mode}`);
  assert(state.fighters?.p2?.x < p2StartX, failures, `local versus ArrowLeft should move P2 left from ${p2StartX}, got ${state.fighters?.p2?.x}`);
  assert(
    ["walkForward", "runForward", "walkBack"].includes(state.fighters?.p2?.state),
    failures,
    `local versus ArrowLeft should drive P2 movement, got ${state.fighters?.p2?.state}`,
  );
  assert(errors.length === 0, failures, `local versus console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return { name: "local-versus-demo", failures, errors, screenshots, state };
}

async function runBrowserSettingsControlsDemo(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const { context, page, errors } = await openScenario(browser, url, {
    viewport: { width: 1024, height: 576 },
  });

  await pressKey(page, "Space");
  await pressKey(page, "Space");
  await pressKey(page, "Space");
  await waitFrames(page, 20);
  await pressKey(page, "KeyP");
  let state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "browser-settings-versus-cpu"));
  assert(state.shellPhase === "paused", failures, `browser settings expected paused, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `browser settings expected versus-cpu, got ${state.playMode}`);
  checkPauseShellPresentation(state, "browser settings versus cpu", failures);
  assert(state.browserSettings?.mode?.id === "versus-cpu", failures, `settings expected versus-cpu, got ${state.browserSettings?.mode?.id}`);
  assert(state.browserSettings?.cpu?.toggleAvailable === true, failures, "settings should allow CPU toggle in 1 VS CPU");
  assert(state.browserSettings?.cpu?.difficulty === "normal", failures, `settings expected normal CPU, got ${state.browserSettings?.cpu?.difficulty}`);
  assert(
    state.browserSettings?.p2?.control === "NORMAL CPU",
    failures,
    `settings expected NORMAL CPU control, got ${state.browserSettings?.p2?.control}`,
  );

  await pressKey(page, "KeyV");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "browser-settings-cpu-hard"));
  assert(state.cpuDifficulty === "hard", failures, `browser settings expected hard CPU after V, got ${state.cpuDifficulty}`);
  assert(
    state.browserSettings?.cpu?.difficulty === "hard",
    failures,
    `settings expected hard CPU difficulty, got ${state.browserSettings?.cpu?.difficulty}`,
  );

  await pressKey(page, "KeyC");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "browser-settings-manual-p2"));
  assert(state.p2Mode === "manual", failures, `browser settings expected manual P2 after C, got ${state.p2Mode}`);
  assert(
    state.browserSettings?.p2?.control === "manual P2",
    failures,
    `settings expected manual P2 control, got ${state.browserSettings?.p2?.control}`,
  );

  await pressKey(page, "KeyR");
  state = await readState(page);
  assert(state.shellPhase === "ready", failures, `browser settings reset expected ready, got ${state.shellPhase}`);

  await pressKey(page, "Space");
  for (let index = 0; index < 3; index += 1) {
    await pressKey(page, "KeyD");
  }
  await pressKey(page, "Space");
  await pressKey(page, "Space");
  await waitFrames(page, 20);
  await pressKey(page, "KeyP");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "browser-settings-local-versus"));
  assert(state.shellPhase === "paused", failures, `local settings expected paused, got ${state.shellPhase}`);
  assert(state.playMode === "local-versus", failures, `local settings expected local-versus, got ${state.playMode}`);
  checkPauseShellPresentation(state, "browser settings local versus", failures);
  assert(state.browserSettings?.mode?.id === "local-versus", failures, `settings expected local-versus, got ${state.browserSettings?.mode?.id}`);
  assert(state.browserSettings?.cpu?.toggleAvailable === false, failures, "local versus settings should lock CPU toggle off");
  assert(
    state.browserSettings?.cpu?.summary?.includes("Local Versus keeps P2 manual"),
    failures,
    `local settings should explain manual P2 lock, got ${state.browserSettings?.cpu?.summary}`,
  );
  assert(
    state.browserSettings?.p2?.controls?.includes("Numpad"),
    failures,
    `local settings should expose P2 numpad controls, got ${state.browserSettings?.p2?.controls}`,
  );

  await pressKey(page, "KeyC");
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "browser-settings-local-versus-cpu-ignored"));
  assert(state.p2Mode === "manual", failures, `local settings CPU toggle should keep manual P2, got ${state.p2Mode}`);
  assert(
    state.browserSettings?.p2?.control === "manual P2",
    failures,
    `local settings CPU toggle should keep manual P2 control, got ${state.browserSettings?.p2?.control}`,
  );
  assert(errors.length === 0, failures, `browser settings console/page errors: ${JSON.stringify(errors)}`);

  await context.close();
  return { name: "browser-settings-controls-demo", failures, errors, screenshots, state };
}

async function runRuntimeRosterPromotion(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const states = {};
  const rosterCases = [
    {
      name: "rabbit-cat",
      p1Index: 0,
      p2Index: 1,
      p1Id: "gray-rabbit",
      p2Id: "ginger-tabby-cat",
      p1StaticSlot: "rabbit-portrait",
      p2StaticSlot: "cat-portrait",
    },
    {
      name: "pickles-rabbit",
      p1Index: 2,
      p2Index: 0,
      p1Id: "pugilist-pug",
      p2Id: "gray-rabbit",
      p1StaticSlot: null,
      p2StaticSlot: null,
    },
    {
      name: "cat-pickles",
      p1Index: 1,
      p2Index: 2,
      p1Id: "ginger-tabby-cat",
      p2Id: "pugilist-pug",
      p1StaticSlot: null,
      p2StaticSlot: null,
    },
    {
      name: "noodle-pickles",
      p1Index: 3,
      p2Index: 2,
      p1Id: "ferret-noodle",
      p2Id: "pugilist-pug",
      p1StaticSlot: null,
      p2StaticSlot: null,
    },
  ];

  for (const rosterCase of rosterCases) {
    const { context, page, errors } = await openScenario(browser, url, {
      viewport: { width: 1024, height: 576 },
    });

    await pressKey(page, "Space");
    await pressKey(page, "KeyD");
    await pressKey(page, "KeyD");
    let state = await readState(page);
    assert(state.shellPhase === "mode-select", failures, `${rosterCase.name} expected mode-select, got ${state.shellPhase}`);
    assert(state.playMode === "championship", failures, `${rosterCase.name} expected championship mode, got ${state.playMode}`);
    assert(
      state.playModeLabel === "CHAMPIONSHIP",
      failures,
      `${rosterCase.name} expected CHAMPIONSHIP label, got ${state.playModeLabel}`,
    );
    checkModeShellPresentation(state, `${rosterCase.name} championship mode-select`, "championship", "CHAMPIONSHIP", "2026", failures);

    await pressKey(page, "Space");
    await selectRosterPair(page, { p1Index: rosterCase.p1Index, p2Index: rosterCase.p2Index });
    state = await readState(page);
    states[`${rosterCase.name}-select`] = state;
    screenshots.push(await screenshot(page, outDir, `runtime-roster-${rosterCase.name}-select`));
    checkRuntimeRosterState(state, `${rosterCase.name} select`, failures);
    checkSelectShellPresentation(state, `${rosterCase.name} select`, failures);
    assert(
      state.selectedFighterDetails?.p1?.fighterId === rosterCase.p1Id,
      failures,
      `${rosterCase.name} select expected P1 ${rosterCase.p1Id}, got ${state.selectedFighterDetails?.p1?.fighterId}`,
    );
    assert(
      state.selectedFighterDetails?.p2?.fighterId === rosterCase.p2Id,
      failures,
      `${rosterCase.name} select expected P2 ${rosterCase.p2Id}, got ${state.selectedFighterDetails?.p2?.fighterId}`,
    );

    await pressKey(page, "Space");
    await waitFrames(page, 54);
    state = await readState(page);
    states[`${rosterCase.name}-fight`] = state;
    screenshots.push(await screenshot(page, outDir, `runtime-roster-${rosterCase.name}-fight`));
    assert(state.shellPhase === "fighting", failures, `${rosterCase.name} expected fighting, got ${state.shellPhase}`);
    assert(state.playMode === "championship", failures, `${rosterCase.name} fight expected championship, got ${state.playMode}`);
    assert(state.p2Mode === "cpu", failures, `${rosterCase.name} fight expected CPU opponent, got ${state.p2Mode}`);
    assert(
      state.cpuOpponent?.fighterId === rosterCase.p2Id,
      failures,
      `${rosterCase.name} expected CPU opponent ${rosterCase.p2Id}, got ${state.cpuOpponent?.fighterId}`,
    );
    assert(
      state.storyMode?.firstBeat?.includes("Pickles Pugilist") &&
        state.storyMode?.firstBeat?.includes("Noodle Nibbles"),
      failures,
      `${rosterCase.name} championship beat should include promoted runtime rivals`,
    );
    assert(
      state.storyMode?.selectedRivals?.map((fighter) => fighter.fighterId).join(",") ===
        `${rosterCase.p1Id},${rosterCase.p2Id}`,
      failures,
      `${rosterCase.name} story rivals should match selected fighters`,
    );
    assert(
      state.runtimeVisuals?.p1?.fighterId === rosterCase.p1Id,
      failures,
      `${rosterCase.name} runtime P1 expected ${rosterCase.p1Id}, got ${state.runtimeVisuals?.p1?.fighterId}`,
    );
    assert(
      state.runtimeVisuals?.p2?.fighterId === rosterCase.p2Id,
      failures,
      `${rosterCase.name} runtime P2 expected ${rosterCase.p2Id}, got ${state.runtimeVisuals?.p2?.fighterId}`,
    );
    assert(
      state.assetReadiness?.runtimeFallbacks?.fighterAnimations === 0,
      failures,
      `${rosterCase.name} expected zero fighter fallbacks, got ${state.assetReadiness?.runtimeFallbacks?.fighterAnimations}`,
    );
    checkRuntimeUiLoaded(state, `${rosterCase.name} fight`, failures);
    checkHudPortrait(state, "p1", rosterCase.p1Id, rosterCase.p1StaticSlot, `${rosterCase.name} P1`, failures);
    checkHudPortrait(state, "p2", rosterCase.p2Id, rosterCase.p2StaticSlot, `${rosterCase.name} P2`, failures);
    if (rosterCase.p1Id === "ferret-noodle" || rosterCase.p2Id === "ferret-noodle") {
      const noodlePlayer = rosterCase.p1Id === "ferret-noodle" ? "p1" : "p2";
      const noodleVisual = state.runtimeVisuals?.[noodlePlayer];
      assert(noodleVisual?.kind === "sprite", failures, `${rosterCase.name} Noodle should render as a runtime sprite`);
      assert(
        noodleVisual?.assetKey?.startsWith("ferret-noodle:") === true,
        failures,
        `${rosterCase.name} Noodle sprite key should be ferret-noodle runtime, got ${noodleVisual?.assetKey}`,
      );
      assert(
        noodleVisual?.path?.startsWith("/assets/generated/fighters/ferret-noodle/") === true,
        failures,
        `${rosterCase.name} Noodle sprite path should resolve from public runtime assets, got ${noodleVisual?.path}`,
      );
      await checkNoodleRuntimeRowsFetched(page, rosterCase.name, failures);
    }
    assert(errors.length === 0, failures, `${rosterCase.name} console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  return { name: "four-fighter-runtime-promotion", failures, errors: [], screenshots, states };
}

async function runChampionshipLadderProgression(browser, url, outDir) {
  const failures = [];
  const screenshots = [];
  const states = {};

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "championship-ladder-advance"), {
      viewport: { width: 1024, height: 576 },
    });
    let state = await readState(page);
    states["advance-match-over"] = state;
    screenshots.push(await screenshot(page, outDir, "championship-ladder-advance-match-over"));
    assert(state.shellPhase === "match-over", failures, `advance demo expected match-over, got ${state.shellPhase}`);
    assert(state.playMode === "championship", failures, `advance demo expected championship, got ${state.playMode}`);
    assert(
      state.storyMode?.ladder?.status === "in-progress",
      failures,
      `advance demo expected in-progress ladder, got ${state.storyMode?.ladder?.status}`,
    );
    assert(
      state.storyMode?.ladder?.completedOpponents?.map((fighter) => fighter.fighterId).join(",") === "ginger-tabby-cat",
      failures,
      "advance demo should record the first defeated opponent",
    );
    assert(
      state.storyMode?.ladder?.currentOpponent?.fighterId === "pugilist-pug",
      failures,
      `advance demo expected Pickles next, got ${state.storyMode?.ladder?.currentOpponent?.fighterId}`,
    );
    assert(
      state.storyMode?.ladder?.totalOpponents === EXPECTED_RUNTIME_PLAYABLE_COUNT - 1,
      failures,
      `advance demo should expose ${EXPECTED_RUNTIME_PLAYABLE_COUNT - 1}-opponent ladder`,
    );
    assert(
      state.storyMode?.presentation?.headline === "ADVANCE TO NEXT RIVAL",
      failures,
      `advance demo expected advance headline, got ${state.storyMode?.presentation?.headline}`,
    );
    assert(
      state.storyMode?.presentation?.body?.includes("Pickles Pugilist"),
      failures,
      "advance demo should name Pickles in presentation copy",
    );
    checkChampionshipRewardInterstitial(state, "advance demo", "advance", "checkpoint", "1/3", failures);
    assert(
      state.storyMode?.presentation?.reward?.claimLine?.includes("couch rights still pending"),
      failures,
      `advance demo should expose pending couch-rights reward, got ${state.storyMode?.presentation?.reward?.claimLine}`,
    );
    assert(
      state.storyMode?.presentation?.interstitial?.payoffLine?.includes("legal tender"),
      failures,
      `advance demo should expose comic payoff, got ${state.storyMode?.presentation?.interstitial?.payoffLine}`,
    );
    assert(
      state.storyMode?.presentation?.opponentOrderLabel?.includes("DONE Ginger Tabby Cat") &&
        state.storyMode?.presentation?.opponentOrderLabel?.includes("NEXT Pickles Pugilist"),
      failures,
      `advance demo expected DONE/NEXT opponent order, got ${state.storyMode?.presentation?.opponentOrderLabel}`,
    );

    await pressKey(page, "Space");
    await waitFrames(page, 24);
    state = await readState(page);
    states["advance-next-fight"] = state;
    screenshots.push(await screenshot(page, outDir, "championship-ladder-next-fight"));
    assert(state.shellPhase === "fighting", failures, `ladder advance expected fighting, got ${state.shellPhase}`);
    assert(
      state.runtimeVisuals?.p2?.fighterId === "pugilist-pug",
      failures,
      `ladder advance expected Pickles as next CPU, got ${state.runtimeVisuals?.p2?.fighterId}`,
    );
    assert(
      state.cpuOpponent?.fighterId === "pugilist-pug",
      failures,
      `ladder advance expected CPU opponent Pickles, got ${state.cpuOpponent?.fighterId}`,
    );
    assert(
      state.storyMode?.ladder?.currentOpponentNumber === 2,
      failures,
      `ladder advance expected opponent 2, got ${state.storyMode?.ladder?.currentOpponentNumber}`,
    );
    assert(
      state.storyMode?.ladder?.completedOpponents?.map((fighter) => fighter.fighterId).join(",") === "ginger-tabby-cat",
      failures,
      "ladder advance should preserve completed opponent after next fight starts",
    );
    assert(
      state.storyMode?.presentation?.headline === "SNACKBELT LADDER 2/3",
      failures,
      `ladder advance expected 2/3 headline, got ${state.storyMode?.presentation?.headline}`,
    );
    assert(
      state.storyMode?.presentation?.currentRival?.fighterId === "pugilist-pug",
      failures,
      `ladder advance expected Pickles current rival, got ${state.storyMode?.presentation?.currentRival?.fighterId}`,
    );
    assert(
      state.storyMode?.presentation?.body?.includes("trophy was edible"),
      failures,
      "ladder advance should surface Pickles story hook",
    );
    checkChampionshipRewardInterstitial(state, "ladder advance next fight", "rival-preview", "up-for-grabs", "1/3", failures);
    assert(
      state.assetReadiness?.runtimeFallbacks?.fighterAnimations === 0,
      failures,
      `ladder advance expected zero fighter fallbacks, got ${state.assetReadiness?.runtimeFallbacks?.fighterAnimations}`,
    );
    checkRuntimeUiLoaded(state, "ladder advance next fight", failures);
    assert(errors.length === 0, failures, `ladder advance console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "championship-ladder-clear"), {
      viewport: { width: 1024, height: 576 },
    });
    const state = await readState(page);
    states["clear-match-over"] = state;
    screenshots.push(await screenshot(page, outDir, "championship-ladder-clear-match-over"));
    assert(state.shellPhase === "match-over", failures, `clear demo expected match-over, got ${state.shellPhase}`);
    assert(
      state.storyMode?.ladder?.status === "complete",
      failures,
      `clear demo expected complete ladder, got ${state.storyMode?.ladder?.status}`,
    );
    assert(
      state.storyMode?.ladder?.result === "cleared",
      failures,
      `clear demo expected cleared result, got ${state.storyMode?.ladder?.result}`,
    );
    assert(
      state.storyMode?.ladder?.completedOpponents?.map((fighter) => fighter.fighterId).join(",") ===
        "ginger-tabby-cat,pugilist-pug,ferret-noodle",
      failures,
      "clear demo should record all defeated runtime opponents",
    );
    assert(
      state.storyMode?.ladder?.remainingOpponents?.length === 0,
      failures,
      "clear demo should have no remaining opponents",
    );
    assert(
      state.storyMode?.presentation?.headline === "SNACKBELT CLEARED",
      failures,
      `clear demo expected cleared presentation, got ${state.storyMode?.presentation?.headline}`,
    );
    assert(
      state.storyMode?.presentation?.callToAction === "Enter: restart ladder",
      failures,
      `clear demo expected restart CTA, got ${state.storyMode?.presentation?.callToAction}`,
    );
    checkChampionshipRewardInterstitial(state, "ladder clear", "cleared", "claimed", "3/3", failures);
    assert(
      state.storyMode?.presentation?.reward?.claimLine?.includes("good couch naming rights"),
      failures,
      `clear demo should expose couch-rights reward, got ${state.storyMode?.presentation?.reward?.claimLine}`,
    );
    assert(
      state.storyMode?.presentation?.interstitial?.payoffLine?.includes("paperwork"),
      failures,
      `clear demo should expose paperwork payoff, got ${state.storyMode?.presentation?.interstitial?.payoffLine}`,
    );
    assert(errors.length === 0, failures, `ladder clear console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  {
    const { context, page, errors } = await openScenario(browser, urlWithDemo(url, "championship-ladder-fail"), {
      viewport: { width: 1024, height: 576 },
    });
    const state = await readState(page);
    states["fail-match-over"] = state;
    screenshots.push(await screenshot(page, outDir, "championship-ladder-fail-match-over"));
    assert(state.shellPhase === "match-over", failures, `fail demo expected match-over, got ${state.shellPhase}`);
    assert(
      state.storyMode?.ladder?.status === "complete",
      failures,
      `fail demo expected complete ladder, got ${state.storyMode?.ladder?.status}`,
    );
    assert(
      state.storyMode?.ladder?.result === "failed",
      failures,
      `fail demo expected failed result, got ${state.storyMode?.ladder?.result}`,
    );
    assert(
      state.storyMode?.presentation?.headline === "SNACKBELT RUN ENDED",
      failures,
      `fail demo expected failed presentation, got ${state.storyMode?.presentation?.headline}`,
    );
    assert(
      state.storyMode?.presentation?.body?.includes("Ginger Tabby Cat"),
      failures,
      "fail demo should name the rival that stopped the run",
    );
    checkChampionshipRewardInterstitial(state, "ladder fail", "failed", "lost", "0/3", failures);
    assert(
      state.storyMode?.presentation?.reward?.claimLine?.includes("rematch"),
      failures,
      `fail demo should expose rematch reward state, got ${state.storyMode?.presentation?.reward?.claimLine}`,
    );
    assert(errors.length === 0, failures, `ladder fail console/page errors: ${JSON.stringify(errors)}`);
    await context.close();
  }

  return { name: "championship-ladder", failures, errors: [], screenshots, states };
}

function checkRuntimeRosterState(state, scenario, failures) {
  const rosterIds = Array.isArray(state.runtimeRoster)
    ? state.runtimeRoster.map((fighter) => fighter.fighterId)
    : [];
  assert(
    rosterIds.join(",") === EXPECTED_RUNTIME_ROSTER_IDS.join(","),
    failures,
    `${scenario} expected runtime roster ${EXPECTED_RUNTIME_ROSTER_IDS.join(",")}, got ${rosterIds.join(",")}`,
  );
  for (const player of ["p1", "p2"]) {
    assert(
      typeof state.selectedFighterDetails?.[player]?.storyHook === "string",
      failures,
      `${scenario} ${player} should expose a story hook`,
    );
    assert(
      typeof state.selectedFighterDetails?.[player]?.trainingTip === "string",
      failures,
      `${scenario} ${player} should expose a training tip`,
    );
  }
  for (const fighter of state.runtimeRoster ?? []) {
    assert(typeof fighter.leagueName === "string", failures, `${scenario} ${fighter.fighterId} should expose league identity`);
    assert(typeof fighter.storyHook === "string", failures, `${scenario} ${fighter.fighterId} should expose story hook`);
    assert(typeof fighter.signatureMove === "string", failures, `${scenario} ${fighter.fighterId} should expose signature move`);
    assert(typeof fighter.superMove === "string", failures, `${scenario} ${fighter.fighterId} should expose super move`);
  }
}

function checkHudPortrait(state, player, fighterId, staticSlot, scenario, failures) {
  const portrait = state.runtimeUi?.hudPortraits?.[player];
  const visibleSlots = visibleRuntimeUiSlots(state);
  assert(portrait?.fighterId === fighterId, failures, `${scenario} HUD expected ${fighterId}, got ${portrait?.fighterId}`);
  assert(
    portrait?.staticSlot === staticSlot,
    failures,
    `${scenario} HUD static slot expected ${staticSlot}, got ${portrait?.staticSlot}`,
  );
  if (staticSlot) {
    assert(visibleSlots.includes(staticSlot), failures, `${scenario} expected visible static slot ${staticSlot}`);
    assert(portrait?.dynamicVisible === false, failures, `${scenario} static portrait should not show a dynamic sprite`);
  } else {
    assert(
      portrait?.dynamicAssetKey === `${fighterId}:idle`,
      failures,
      `${scenario} dynamic portrait expected ${fighterId}:idle, got ${portrait?.dynamicAssetKey}`,
    );
    assert(portrait?.dynamicVisible === true, failures, `${scenario} dynamic portrait should be visible`);
    assert(portrait?.usesFallback === false, failures, `${scenario} dynamic portrait should not use fallback`);
    assert(!visibleSlots.includes("rabbit-portrait"), failures, `${scenario} should not expose rabbit portrait slot`);
    assert(!visibleSlots.includes("cat-portrait"), failures, `${scenario} should not expose cat portrait slot`);
  }
}

async function checkNoodleRuntimeRowsFetched(page, scenario, failures) {
  const rows = await page.evaluate(async (rowIds) => {
    return Promise.all(
      rowIds.map(async (rowId) => {
        const path = `/assets/generated/fighters/ferret-noodle/${rowId}.png`;
        try {
          const response = await fetch(path, { cache: "no-store" });
          const bytes = response.ok ? (await response.arrayBuffer()).byteLength : 0;
          return {
            rowId,
            path,
            ok: response.ok,
            status: response.status,
            contentType: response.headers.get("content-type") ?? "",
            bytes,
          };
        } catch (error) {
          return { rowId, path, ok: false, status: 0, contentType: "", bytes: 0, error: String(error) };
        }
      }),
    );
  }, NOODLE_RUNTIME_ROWS);

  const missing = rows.filter((row) => row.ok !== true || row.bytes <= 0);
  assert(missing.length === 0, failures, `${scenario} missing Noodle runtime rows: ${JSON.stringify(missing)}`);
  const nonPng = rows.filter((row) => !row.contentType.includes("image/png"));
  assert(nonPng.length === 0, failures, `${scenario} Noodle rows should be served as PNG: ${JSON.stringify(nonPng)}`);
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
  screenshots.push(await screenshot(page, outDir, "gamepad-mode-select"));
  assert(state.shellPhase === "mode-select", failures, `gamepad south confirm expected mode-select phase, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `gamepad default play mode expected versus-cpu, got ${state.playMode}`);
  checkRuntimeUiLoaded(state, "gamepad mode-select", failures);
  checkOnlyRuntimeUiSlots(state, "gamepad mode-select", TITLE_UI_SLOTS, failures);

  await pressGamepadButton(page, GAMEPAD_BUTTON.South);
  state = await readState(page);
  screenshots.push(await screenshot(page, outDir, "gamepad-select"));
  assert(state.shellPhase === "select", failures, `gamepad second south confirm expected select phase, got ${state.shellPhase}`);
  checkRuntimeUiLoaded(state, "gamepad select", failures);
  checkOnlyRuntimeUiSlots(state, "gamepad select", TITLE_UI_SLOTS, failures);

  state = await holdGamepadInput(page, { buttons: { [GAMEPAD_BUTTON.South]: true } }, 10);
  screenshots.push(await screenshot(page, outDir, "gamepad-confirm-held"));
  assert(state.shellPhase === "fighting", failures, `gamepad held south confirm expected fighting phase, got ${state.shellPhase}`);
  assert(state.fighters?.p1?.state === "idle", failures, `gamepad held south confirm should not buffer lightAttack, got ${state.fighters?.p1?.state}`);
  await pressKey(page, "KeyC");
  state = await readState(page);
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
  checkPauseShellPresentation(state, "gamepad pause", failures);
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
  const modeSelectShot = await screenshot(page, outDir, `${name}-mode-select`);
  assert(state.shellPhase === "mode-select", failures, `${name} mode select expected mode-select phase, got ${state.shellPhase}`);
  assert(state.playMode === "versus-cpu", failures, `${name} default play mode expected versus-cpu, got ${state.playMode}`);
  checkRuntimeUiLoaded(state, `${name} mode select`, failures);
  checkOnlyRuntimeUiSlots(state, `${name} mode select`, TITLE_UI_SLOTS, failures);

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
  state = await sampleFramePacing(page);
  checkFramePacing(state, name, failures);

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
      modeSelectShot,
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
    checkEndShellPresentation(state, "ko round-over", "Enter/Space next round", failures);
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
    checkEndShellPresentation(state, "win match-over", "Enter/Space rematch", failures);
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
    checkEndShellPresentation(state, "cat-win match-over", "Enter/Space rematch", failures);
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
    results.push(await runCombatReadabilityDemo(browser, args.url, args.outDir));
    results.push(await runTrainingDemo(browser, args.url, args.outDir));
    results.push(await runLocalVersusDemo(browser, args.url, args.outDir));
    results.push(await runBrowserSettingsControlsDemo(browser, args.url, args.outDir));
    results.push(await runRuntimeRosterPromotion(browser, args.url, args.outDir));
    results.push(await runChampionshipLadderProgression(browser, args.url, args.outDir));
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
