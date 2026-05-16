import Phaser from "phaser";
import {
  buildAssetReadinessSummary,
  renderAssetForAnimationId,
  renderAssetForState,
  resolveFighterRuntimeAsset,
  type FighterAnimationId,
  type FighterRuntimeAsset,
  type StageRuntimeLayer,
  resolveManifestRuntimeAssetForSnapshot,
  resolveStageRuntimeLayers,
  visualStateForSnapshot,
  type RuntimeSpriteAsset,
} from "../assets";
import {
  FightingSimulation,
  buttonsFromKeys,
  createCpuInput,
  createInput,
  createMatchSet,
  recordRoundOutcome,
  POWER_METER_MAX,
  POWER_METER_STOCK,
  TICK_MS,
  type CombatEvent,
  type CommandId,
  type CpuDifficulty,
  type MatchSetState,
  type MatchSnapshot,
} from "../core";
import { ArenaAudio, audioCuesForCombatEvents, audioCueForMatchTransition } from "./audio";
import { buildControlFallbackState, type ControlFallbackState } from "./controlFallback";
import {
  combatEffectStyle,
  damageNumbersFromSnapshot,
  damageNumberStyleForMove,
  effectsFromSnapshot,
  tickCombatEffects,
  tickDamageNumbers,
  type CombatEffect,
  type DamageNumberPopup,
} from "./effects";
import {
  RUNTIME_UI_IMAGE_SPECS,
  meowtalKombatConfig,
  nextCpuDifficultyFromConfig,
  type RuntimeUiAssetConfig,
  type RuntimeUiAssetId,
  type RuntimeUiImageSlot,
  selectedFighterFromConfig,
  versionedAssetFromConfig,
} from "./gameConfig";
import { createFramePacingState, stepFramePacing } from "./framePacing";
import {
  EMPTY_GAMEPAD_INPUT,
  gamepadControlJustPressed,
  gamepadInputFromGamepads,
  type GamepadInputState,
} from "./gamepadInput";
import { fighterMobilityMotionCue, fighterRollMotionCue, fighterVisualSeparationOffset, impactFeedbackCue } from "./presentation";
import {
  initialShellState,
  playModeUsesCpu,
  reduceShellState,
  selectedPlayMode,
  shellModeDescription,
  shellModeLabel,
  type ShellState,
} from "./shellFlow";
import { selectSpritePose, spriteStanceConventionForAnimation } from "./spriteFrame";
import {
  spriteReferenceArea,
  spriteVisualScaleForBounds,
  type SpriteFrameVisualBounds,
} from "./spriteVisualSizing";
import {
  TOUCH_CONTROL_IDS,
  touchControlAtPoint,
  touchControlLayoutForViewport,
  touchControlJustPressed,
  touchControlZonesForPhase,
  touchControlsVisibleForViewport,
  touchInputFromControls,
  type TouchControlLayout,
  type TouchControlId,
} from "./touchControls";
import { meterFillPlan, touchControlChrome, type TouchControlChrome } from "./uiChrome";

type KeyMap = Record<string, Phaser.Input.Keyboard.Key>;
type ImpactFlash = { color: number; alpha: number; remainingFrames: number; totalFrames: number };
type StageLayerImage = { layer: StageRuntimeLayer; image: Phaser.GameObjects.Image };
interface SelectedFighterTextProfile {
  fighterId: string;
  displayName: string;
  leagueName: string;
  rosterIndex: number;
  storyHook: string | null;
  trainingTip: string | null;
  signatureMove: string | null;
  superMove: string | null;
}
interface FighterStoryTextProfile {
  fighterId: string;
  displayName: string;
  leagueName: string;
  storyHook: string | null;
  signatureMove: string | null;
  superMove: string | null;
}
type ChampionshipInterstitialKind = "intro" | "rival-preview" | "advance" | "cleared" | "failed";
type ChampionshipRewardStatus = "up-for-grabs" | "checkpoint" | "claimed" | "lost";
interface ChampionshipRewardInterstitial {
  kind: ChampionshipInterstitialKind;
  progressLine: string;
  payoffLine: string;
  nextAction: string;
  rosterTruth: string;
  completedCount: number;
  totalOpponents: number;
}
interface ChampionshipRewardState {
  title: string;
  status: ChampionshipRewardStatus;
  claimLine: string;
}
type ChampionshipLadderStatus = "inactive" | "in-progress" | "complete";
type ChampionshipLadderResult = "cleared" | "failed" | null;
interface ChampionshipLadderState {
  status: ChampionshipLadderStatus;
  result: ChampionshipLadderResult;
  playerFighterId: string | null;
  opponentIds: readonly string[];
  opponentIndex: number;
  completedOpponentIds: readonly string[];
}
const GAME_CONFIG = meowtalKombatConfig;
const GAME_TITLE = GAME_CONFIG.title;
const GAME_SUBTITLE = GAME_CONFIG.subtitle;
const FIGHTER_ROSTER = GAME_CONFIG.roster;
const FIGHTER_ASSET_MANIFESTS = GAME_CONFIG.fighterAssetManifests;
const CONCEPT_SHEET = GAME_CONFIG.conceptSheet;
const RUNTIME_SPRITESHEETS = GAME_CONFIG.runtimeSpritesheets;
const RUNTIME_SPRITE_CELL_SIZE = GAME_CONFIG.runtimeSpriteCellSize;
const RUNTIME_UI_ASSETS = GAME_CONFIG.runtimeUiAssets;

export class MeowtalArenaScene extends Phaser.Scene {
  private selectedFighterIndex: Record<"p1" | "p2", number> = { ...GAME_CONFIG.defaultSelections };
  private shell: ShellState = initialShellState;
  private simulation = this.createSimulation();
  private framePacing = createFramePacingState();
  private snapshot: MatchSnapshot = this.simulation.snapshot();
  private matchSet: MatchSetState = createMatchSet();
  private championshipLadder: ChampionshipLadderState = inactiveChampionshipLadder();
  private p2CpuEnabled = true;
  private cpuDifficulty: CpuDifficulty = "normal";
  private readonly assetReadiness = buildAssetReadinessSummary(FIGHTER_ASSET_MANIFESTS, [GAME_CONFIG.stage]);
  private readonly audio = new ArenaAudio();
  private readonly demoMode = new URLSearchParams(window.location.search).get("demo");
  private readonly freezeDemoFrame =
    this.demoMode === "jump" ||
    this.demoMode === "light-kick" ||
    this.demoMode === "hitstun" ||
    this.demoMode === "blockstun" ||
    this.demoMode === "heavy-punch" ||
    this.demoMode === "special" ||
    this.demoMode === "super" ||
    this.demoMode === "hop" ||
    this.demoMode === "run-forward" ||
    this.demoMode === "backdash" ||
    this.demoMode === "roll-forward" ||
    this.demoMode === "roll-back" ||
    this.demoMode === "knockdown" ||
    isCombatReadabilityDemoMode(this.demoMode);
  private effects: readonly CombatEffect[] = [];
  private damageNumbers: readonly DamageNumberPopup[] = [];
  private damageNumberTexts: Phaser.GameObjects.Text[] = [];
  private impactFlash: ImpactFlash | null = null;
  private shellFrame = 0;
  private shellPhaseFrame = 0;
  private keys!: KeyMap;
  private statusText!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private modeText!: Phaser.GameObjects.Text;
  private p1NameText!: Phaser.GameObjects.Text;
  private p2NameText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private readinessText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;
  private versusText!: Phaser.GameObjects.Text;
  private championshipTitleText!: Phaser.GameObjects.Text;
  private championshipBodyText!: Phaser.GameObjects.Text;
  private trainingTitleText!: Phaser.GameObjects.Text;
  private trainingBodyText!: Phaser.GameObjects.Text;
  private conceptPreviews!: Record<"p1" | "p2", Phaser.GameObjects.Image | null>;
  private runtimeUiImages!: Record<RuntimeUiImageSlot, Phaser.GameObjects.Image>;
  private hudPortraitSprites!: Record<"p1" | "p2", Phaser.GameObjects.Sprite>;
  private selectSprites!: Record<"p1" | "p2", Phaser.GameObjects.Sprite>;
  private fighterSprites!: Record<"p1" | "p2", Phaser.GameObjects.Sprite>;
  private spriteVisualScales = new Map<string, readonly number[]>();
  private lastFighterSpriteScales: Record<"p1" | "p2", number> = { p1: 1, p2: 1 };
  private stageLayerImages: StageLayerImage[] = [];
  private readonly graphicsKey = "arena-debug";
  private readonly effectsGraphicsKey = "arena-effects";
  private readonly runtimeUiMeterGraphicsKey = "arena-runtime-ui-meters";
  private readonly shellOverlayGraphicsKey = "arena-shell-overlay";
  private readonly touchControlsGraphicsKey = "arena-touch-controls";
  private readonly stageRuntimeLayers = resolveStageRuntimeLayers(GAME_CONFIG.stage);
  private readonly pointerTouchControls = new Map<number, TouchControlId>();
  private activeTouchControls = new Set<TouchControlId>();
  private previousTouchControls = new Set<TouchControlId>();
  private previousGamepadInput: GamepadInputState = EMPTY_GAMEPAD_INPUT;
  private suppressGamepadLightUntilReleased = false;
  private suppressKeyboardLightUntilReleased = false;
  private suppressKeyboardSpecialUntilReleased = false;
  private touchControlLabels!: Record<TouchControlId, Phaser.GameObjects.Text>;

  constructor() {
    super("MeowtalArenaScene");
  }

  preload(): void {
    if (CONCEPT_SHEET) {
      this.load.image(CONCEPT_SHEET.key, CONCEPT_SHEET.path);
    }
    for (const layer of this.stageRuntimeLayers) {
      if (layer.kind === "image-layer" && layer.outputPath) {
        this.load.image(layer.assetKey, versionedAsset(layer.outputPath));
      }
    }
    for (const asset of RUNTIME_UI_ASSETS) {
      this.load.image(asset.key, versionedAsset(asset.path));
    }
    for (const spritesheet of RUNTIME_SPRITESHEETS) {
      this.load.spritesheet(spritesheet.key, versionedAsset(spritesheet.path), {
        frameWidth: RUNTIME_SPRITE_CELL_SIZE,
        frameHeight: RUNTIME_SPRITE_CELL_SIZE,
      });
    }
  }

  create(): void {
    this.input.keyboard?.removeAllKeys();
    this.keys = this.input.keyboard?.addKeys({
      p1Left: "A",
      p1Right: "D",
      p1RightAlt: "B",
      p1Down: "S",
      p1Jump: "W",
      p1Light: "J",
      p1LightAlt: "SPACE",
      p1Kick: "I",
      p1Heavy: "K",
      p1Special: "L",
      p1SpecialAlt: "ENTER",
      start: "ENTER",
      startAlt: "SPACE",
      p2Left: "LEFT",
      p2Right: "RIGHT",
      p2Down: "DOWN",
      p2Jump: "UP",
      p2Light: "NUMPAD_ONE",
      p2Kick: "NUMPAD_FOUR",
      p2Heavy: "NUMPAD_TWO",
      p2Special: "NUMPAD_THREE",
      cpuToggle: "C",
      cpuDifficulty: "V",
      pause: "P",
      pauseAlt: "ESC",
      reset: "R",
      fullscreen: "F",
    }) as KeyMap;

    this.cameras.main.setBackgroundColor("#163936");
    this.statusText = this.add
      .text(512, 30, "", {
        color: "#fff7df",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "22px",
        fontStyle: "900",
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true);
    this.statusText.setDepth(100);
    this.roundText = this.add
      .text(512, 78, "", {
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "700",
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(100);
    this.modeText = this.add
      .text(882, 82, "", {
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "700",
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(100);
    this.p1NameText = this.add
      .text(104, 24, "", {
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "800",
      })
      .setOrigin(0, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(100);
    this.p2NameText = this.add
      .text(920, 24, "", {
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "800",
      })
      .setOrigin(1, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(100);
    this.comboText = this.add
      .text(176, 132, "", {
        backgroundColor: "#0b1817",
        color: "#fff1a8",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "800",
      })
      .setOrigin(0, 0)
      .setPadding(8, 4, 8, 4)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(100)
      .setVisible(false);
    this.readinessText = this.add
      .text(512, 342, "", {
        align: "center",
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "12px",
        lineSpacing: 4,
        wordWrap: { width: 720 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(101)
      .setVisible(false);
    this.titleText = this.add
      .text(512, 182, "", {
        align: "center",
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "34px",
        fontStyle: "800",
        stroke: "#22140f",
        strokeThickness: 7,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(101);
    this.helpText = this.add
      .text(512, 258, "", {
        align: "center",
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px",
        lineSpacing: 10,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(101);
    this.versusText = this.add
      .text(512, 360, "VS", {
        align: "center",
        color: "#fff1a8",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "26px",
        fontStyle: "900",
      })
      .setOrigin(0.5, 0.5)
      .setShadow(0, 2, "#000000", 5, true, true)
      .setDepth(101)
      .setVisible(false);
    this.championshipTitleText = this.add
      .text(512, 106, "", {
        align: "center",
        color: "#fff1a8",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "900",
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(103)
      .setVisible(false);
    this.championshipBodyText = this.add
      .text(512, 126, "", {
        align: "center",
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        lineSpacing: 2,
        wordWrap: { width: 590 },
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(103)
      .setVisible(false);
    this.trainingTitleText = this.add
      .text(512, 106, "", {
        align: "center",
        color: "#bff7e8",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "900",
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(103)
      .setVisible(false);
    this.trainingBodyText = this.add
      .text(512, 126, "", {
        align: "center",
        color: "#f8f5e9",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "11px",
        lineSpacing: 2,
        wordWrap: { width: 590 },
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(103)
      .setVisible(false);
    this.conceptPreviews = {
      p1: this.createConceptPreview("p1"),
      p2: this.createConceptPreview("p2"),
    };
    this.runtimeUiImages = this.createRuntimeUiImages();
    this.hudPortraitSprites = {
      p1: this.add.sprite(72, 130, this.initialSpriteKey("p1"), 0).setOrigin(0.5, 1).setDepth(86).setVisible(false),
      p2: this.add.sprite(952, 130, this.initialSpriteKey("p2"), 0).setOrigin(0.5, 1).setDepth(86).setVisible(false),
    };
    this.fighterSprites = {
      p1: this.add.sprite(0, 0, this.initialSpriteKey("p1"), 0).setOrigin(0.5, 1).setDepth(55).setVisible(false),
      p2: this.add.sprite(0, 0, this.initialSpriteKey("p2"), 0).setOrigin(0.5, 1).setDepth(55).setVisible(false),
    };
    this.selectSprites = {
      p1: this.add.sprite(318, 470, this.initialSpriteKey("p1"), 0).setOrigin(0.5, 1).setDepth(100).setVisible(false),
      p2: this.add.sprite(706, 470, this.initialSpriteKey("p2"), 0).setOrigin(0.5, 1).setDepth(100).setVisible(false),
    };
    this.stageLayerImages = this.stageRuntimeLayers
      .filter((layer) => layer.kind === "image-layer" && this.textures.exists(layer.assetKey))
      .map((layer, index) => ({
        layer,
        image: this.add.image(512, 288, layer.assetKey).setDisplaySize(1104, 621).setDepth(1 + index).setVisible(false),
      }));
    this.spriteVisualScales = this.buildSpriteVisualScaleMap();
    this.touchControlLabels = this.createTouchControlLabels();
    this.installTouchInput();
    this.installDebugHooks();
    this.applyDemoMode();
  }

  update(_time: number, delta: number): void {
    if (this.freezeDemoFrame) {
      this.render();
      return;
    }

    const framePacing = stepFramePacing(this.framePacing, delta);
    this.framePacing = framePacing.state;
    for (let step = 0; step < framePacing.steps; step += 1) {
      this.stepOnce();
    }
    this.render();
  }

  advanceDebug(ms: number): MatchSnapshot {
    if (this.freezeDemoFrame) {
      this.render();
      return this.snapshot;
    }

    const steps = Math.max(1, Math.round(ms / TICK_MS));
    for (let index = 0; index < steps; index += 1) {
      this.stepOnce();
    }
    this.render();
    return this.snapshot;
  }

  renderTextState(): string {
    const runtimeVisuals = {
      p1: this.runtimeAssetFor("p1"),
      p2: this.runtimeAssetFor("p2"),
    };
    const selectedFighterDetails = {
      p1: this.selectedFighterProfile("p1"),
      p2: this.selectedFighterProfile("p2"),
    };
    const browserSettings = this.browserSettingsTextState(selectedFighterDetails);

    return JSON.stringify({
      coordinateSystem: "origin top-left, x right, y down",
      frame: this.snapshot.frame,
      timer: this.snapshot.roundTimer,
      shellPhase: this.shell.phase,
      shellPhaseFrame: this.shellPhaseFrame,
      status: this.snapshot.status,
      framePacing: {
        ...this.framePacing,
        accumulatorMs: roundMetric(this.framePacing.accumulatorMs),
        maxDeltaMs: roundMetric(this.framePacing.maxDeltaMs),
        lastRawDeltaMs: roundMetric(this.framePacing.lastRawDeltaMs),
        lastClampedDeltaMs: roundMetric(this.framePacing.lastClampedDeltaMs),
        lastDroppedMs: roundMetric(this.framePacing.lastDroppedMs),
        totalDroppedMs: roundMetric(this.framePacing.totalDroppedMs),
      },
      winner: this.snapshot.winner,
      combo: this.snapshot.combo,
      p2Mode: this.p2CpuEnabled ? "cpu" : "manual",
      playMode: selectedPlayMode(this.shell),
      playModeLabel: shellModeLabel(this.shell),
      shellPresentation: this.shellPresentationState(selectedFighterDetails),
      storyMode:
        selectedPlayMode(this.shell) === "championship"
          ? {
              status: "implemented-ladder",
              championshipName: GAME_CONFIG.contentSpine.championship.name,
              premise: GAME_CONFIG.contentSpine.championship.premise,
              firstBeat: GAME_CONFIG.contentSpine.championship.firstStoryBeat,
              selectedRivals: [selectedFighterDetails.p1, selectedFighterDetails.p2],
              ladder: this.championshipLadderTextState(),
              presentation: this.championshipPresentationState(),
            }
          : null,
      training: {
        ...this.trainingTextState(),
      },
      localVersus: this.localVersusTextState(selectedFighterDetails),
      browserSettings,
      cpuDifficulty: this.cpuDifficulty,
      cpuOpponent: this.p2CpuEnabled ? selectedFighterDetails.p2 : null,
      runtimeRoster: this.runtimeRosterState(),
      selectedFighters: {
        p1: selectedFighterDetails.p1.displayName,
        p2: selectedFighterDetails.p2.displayName,
      },
      selectedFighterDetails,
      visuals: {
        p1: renderAssetForState(manifestForCharacter(this.snapshot.p1.character), visualStateForSnapshot(this.snapshot.p1)),
        p2: renderAssetForState(manifestForCharacter(this.snapshot.p2.character), visualStateForSnapshot(this.snapshot.p2)),
      },
      runtimeVisuals: {
        p1: runtimeVisuals.p1,
        p2: runtimeVisuals.p2,
      },
      runtimeSpriteScale: {
        p1: roundMetric(this.lastFighterSpriteScales.p1),
        p2: roundMetric(this.lastFighterSpriteScales.p2),
      },
      runtimeStance: {
        rule: "normal gameplay is upright-two-legged for both fighters; grounded-prone-reaction is reserved for knockdown/lose presentation",
        p1: spriteStanceConventionForAnimation(runtimeVisuals.p1.animationId),
        p2: spriteStanceConventionForAnimation(runtimeVisuals.p2.animationId),
      },
      controls: this.controlFallbackState(),
      touchControls: {
        visible: this.shouldShowTouchControls(),
        layout: this.touchControlLayout(),
        viewport: this.touchViewport(),
        activeIds: [...this.activeTouchControls].sort(),
        zones: this.touchControlZones().map((zone) => ({
          id: zone.id,
          label: zone.label,
          group: zone.group,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        })),
      },
      stageRuntime: this.stageRuntimeLayers,
      runtimeUi: {
        allLoaded: this.canRenderRuntimeUi(),
        overlaySlot: this.runtimeOverlaySlot(),
        assets: RUNTIME_UI_ASSETS.map((asset) => ({
          id: asset.id,
          key: asset.key,
          path: asset.path,
          loaded: this.textures.exists(asset.key),
        })),
        visibleSlots: Object.entries(this.runtimeUiImages)
          .filter(([, image]) => image.visible)
          .map(([slot]) => slot),
        hudPortraits: {
          p1: this.hudPortraitState("p1"),
          p2: this.hudPortraitState("p2"),
        },
      },
      assetReadiness: this.assetReadiness,
      conceptArt: {
        key: CONCEPT_SHEET?.key ?? null,
        path: CONCEPT_SHEET?.path ?? null,
        loaded: CONCEPT_SHEET ? this.textures.exists(CONCEPT_SHEET.key) : false,
        visible: this.canRenderConceptArt(),
        canonicalReferences: FIGHTER_ASSET_MANIFESTS.map((manifest) => ({
          fighterId: manifest.id,
          status: manifest.canonicalReference.status,
          outputPath: manifest.canonicalReference.outputPath,
        })),
      },
      selectRuntimeSprites: {
        visible:
          (this.shell.phase === "ready" || this.shell.phase === "mode-select" || this.shell.phase === "select") &&
          !this.canRenderConceptArt(),
        p1AssetKey: this.selectIdleAssetKey("p1"),
        p2AssetKey: this.selectIdleAssetKey("p2"),
      },
      effects: {
        count: this.effects.length,
        kinds: this.effects.map((effect) => effect.kind),
        moves: this.effects.map((effect) => effect.move),
        tiers: this.effects.map((effect) => effect.tier),
        labels: this.effects.map((effect) => effect.label),
        active: this.effects.map((effect) => ({
          kind: effect.kind,
          move: effect.move,
          tier: effect.tier,
          label: effect.label,
          age: effect.age,
          duration: effect.duration,
        })),
      },
      damageNumbers: {
        count: this.damageNumbers.length,
        values: this.damageNumbers.map((number) => number.value),
        kinds: this.damageNumbers.map((number) => number.kind),
        active: this.damageNumbers.map((number) => ({
          kind: number.kind,
          value: number.value,
          age: number.age,
          duration: number.duration,
        })),
      },
      presentation: {
        title: GAME_TITLE,
        subtitle: GAME_SUBTITLE,
        stageArtVisible: this.canRenderStageArt(),
        fullscreen: this.scale.isFullscreen,
      },
      audio: {
        status: this.audio.status(),
        musicActive: this.audio.musicActive(),
      },
      matchSet: {
        round: this.matchSet.round,
        targetWins: this.matchSet.targetWins,
        wins: this.matchSet.wins,
        status: this.matchSet.status,
        lastRoundWinner: this.matchSet.lastRoundWinner,
        matchWinner: this.matchSet.matchWinner,
      },
      fighters: {
        p1: this.snapshot.p1,
        p2: this.snapshot.p2,
      },
      recentEvents: this.snapshot.events,
    });
  }

  private stepOnce(): void {
    const touchControlsThisFrame = new Set(this.activeTouchControls);
    const touchPressed = (id: TouchControlId) =>
      touchControlJustPressed(touchControlsThisFrame, this.previousTouchControls, id);
    const gamepadInputThisFrame = this.readGamepadInput();
    const gamepadPressed = (id: "confirm" | "start" | "pause" | "reset") =>
      gamepadControlJustPressed(gamepadInputThisFrame, this.previousGamepadInput, id);
    const gamepadConfirmPressed = gamepadPressed("confirm");
    const gamepadStartPressed = gamepadPressed("start");
    const shellAcceptsConfirm =
      this.shell.phase === "ready" ||
      this.shell.phase === "mode-select" ||
      this.shell.phase === "select" ||
      this.shell.phase === "round-over" ||
      this.shell.phase === "match-over";

    try {
      const resetPressed = Phaser.Input.Keyboard.JustDown(this.keys.reset) || touchPressed("reset") || gamepadPressed("reset");
      const keyboardEnterConfirmPressed = Phaser.Input.Keyboard.JustDown(this.keys.start);
      const keyboardSpaceConfirmPressed = Phaser.Input.Keyboard.JustDown(this.keys.startAlt);
      const keyboardConfirmPressed = keyboardEnterConfirmPressed || keyboardSpaceConfirmPressed;
      const startPressed =
        touchPressed("start") ||
        (shellAcceptsConfirm && (keyboardConfirmPressed || gamepadStartPressed || gamepadConfirmPressed));
      const pausePressed =
        Phaser.Input.Keyboard.JustDown(this.keys.pause) ||
        Phaser.Input.Keyboard.JustDown(this.keys.pauseAlt) ||
        touchPressed("pause") ||
        gamepadPressed("pause");
      const fullscreenPressed = Phaser.Input.Keyboard.JustDown(this.keys.fullscreen);
      if (Phaser.Input.Keyboard.JustDown(this.keys.cpuToggle) || touchPressed("cpu")) {
        this.p2CpuEnabled = selectedPlayMode(this.shell) === "local-versus" ? false : !this.p2CpuEnabled;
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.cpuDifficulty) || touchPressed("difficulty")) {
        this.cpuDifficulty = nextCpuDifficulty(this.cpuDifficulty);
      }
      if (fullscreenPressed) {
        this.toggleFullscreen();
      }
      if (startPressed || resetPressed || pausePressed || fullscreenPressed) {
        this.audio.play("ui-confirm");
      }
      const previousPhase = this.shell.phase;
      const modePreviousPressed =
        previousPhase === "mode-select" &&
        (Phaser.Input.Keyboard.JustDown(this.keys.p1Left) ||
          Phaser.Input.Keyboard.JustDown(this.keys.p2Left) ||
          touchPressed("left") ||
          (gamepadInputThisFrame.horizontal === -1 && this.previousGamepadInput.horizontal !== -1));
      const modeNextPressed =
        previousPhase === "mode-select" &&
        (Phaser.Input.Keyboard.JustDown(this.keys.p1Right) ||
          Phaser.Input.Keyboard.JustDown(this.keys.p1RightAlt) ||
          Phaser.Input.Keyboard.JustDown(this.keys.p2Right) ||
          touchPressed("right") ||
          (gamepadInputThisFrame.horizontal === 1 && this.previousGamepadInput.horizontal !== 1));
      if (previousPhase === "select") {
        this.handleCharacterSelectInput();
      }
      if (previousPhase !== "paused") {
        this.shellFrame += 1;
        this.effects = tickCombatEffects(this.effects);
        this.damageNumbers = tickDamageNumbers(this.damageNumbers);
        this.impactFlash = tickImpactFlash(this.impactFlash);
      }

      const nextShell = reduceShellState(this.shell, {
        resetPressed,
        startPressed,
        pausePressed,
        modeNextPressed,
        modePreviousPressed,
        matchStatus: this.snapshot.status,
        matchSetStatus: this.matchSet.status,
      });

      const advancingFromMatchOver = this.shell.phase === "match-over" && nextShell.phase === "fighting";
      if (resetPressed) {
        this.championshipLadder = inactiveChampionshipLadder();
      }
      if (advancingFromMatchOver && selectedPlayMode(this.shell) === "championship") {
        this.prepareChampionshipNextMatch();
      }

      if (resetPressed || advancingFromMatchOver) {
        this.matchSet = createMatchSet();
      }

      if (
        resetPressed ||
        ((this.shell.phase === "round-over" || this.shell.phase === "match-over") && nextShell.phase === "fighting")
      ) {
        this.simulation.reset();
        this.snapshot = this.simulation.snapshot();
        this.effects = [];
        this.damageNumbers = [];
        this.impactFlash = null;
      }

      this.shell = nextShell;
      this.shellPhaseFrame = previousPhase === this.shell.phase ? this.shellPhaseFrame + 1 : 0;
      if (
        previousPhase !== "fighting" &&
        this.shell.phase === "fighting" &&
        shellAcceptsConfirm &&
        gamepadConfirmPressed &&
        gamepadInputThisFrame.buttons.light
      ) {
        this.suppressGamepadLightUntilReleased = true;
      }
      if (previousPhase !== "fighting" && this.shell.phase === "fighting" && shellAcceptsConfirm) {
        if (keyboardSpaceConfirmPressed && keyDown(this.keys.p1LightAlt)) {
          this.suppressKeyboardLightUntilReleased = true;
        }
        if (keyboardEnterConfirmPressed && keyDown(this.keys.p1SpecialAlt)) {
          this.suppressKeyboardSpecialUntilReleased = true;
        }
      }

      if (previousPhase === "select" && this.shell.phase === "fighting") {
        this.startSelectedMatch();
        this.audio.play("fight-announcer");
        return;
      }

      if (
        (previousPhase === "round-over" || previousPhase === "match-over") &&
        this.shell.phase === "fighting"
      ) {
        this.audio.play("fight-announcer");
      }

      if (
        resetPressed ||
        (previousPhase === "ready" && this.shell.phase === "select") ||
        (previousPhase === "ready" && this.shell.phase === "mode-select") ||
        (previousPhase === "mode-select" && this.shell.phase === "select") ||
        (previousPhase === "round-over" && this.shell.phase === "fighting") ||
        (previousPhase === "match-over" && this.shell.phase === "fighting") ||
        (previousPhase === "fighting" && this.shell.phase === "paused") ||
        (previousPhase === "paused" && this.shell.phase === "fighting")
      ) {
        return;
      }

      if (this.shell.phase !== "fighting") {
        return;
      }

      const frame = this.snapshot.frame + 1;
      const wasFighting = this.snapshot.status === "fighting";
      this.snapshot = this.simulation.step({
        p1: this.playerOneInput(frame),
        p2: this.playerTwoInput(frame),
      });

      if (wasFighting && this.snapshot.status === "round-over") {
        this.matchSet = recordRoundOutcome(this.matchSet, this.snapshot.winner);
        if (this.matchSet.status === "complete") {
          this.recordChampionshipMatchOutcome();
        }
      }
      this.audio.play(
        audioCueForMatchTransition(wasFighting ? "fighting" : this.snapshot.status, this.snapshot.status, this.matchSet),
      );
      for (const cue of audioCuesForCombatEvents(this.snapshot.events, {
        p1: this.snapshot.p1.character,
        p2: this.snapshot.p2.character,
      })) {
        this.audio.play(cue);
      }
      this.effects = [...this.effects, ...effectsFromSnapshot(this.snapshot)];
      this.damageNumbers = [...this.damageNumbers, ...damageNumbersFromSnapshot(this.snapshot)];
      this.triggerImpactFeedback();

      this.shell = reduceShellState(this.shell, {
        matchStatus: this.snapshot.status,
        matchSetStatus: this.matchSet.status,
      });
    } finally {
      this.previousTouchControls = touchControlsThisFrame;
      this.previousGamepadInput = gamepadInputThisFrame;
    }
  }

  private render(): void {
    const graphics = this.children.getByName(this.graphicsKey) as Phaser.GameObjects.Graphics | null;
    const g = graphics ?? this.add.graphics();
    if (!graphics) {
      g.setName(this.graphicsKey);
      g.setDepth(50);
    }
    g.clear();
    const showFightLayer =
      this.shell.phase !== "ready" && this.shell.phase !== "mode-select" && this.shell.phase !== "select";
    const runtimeUiReady = this.canRenderRuntimeUi();
    const stageImagesRendered = this.renderStageLayers(this.canRenderStageArt());
    if (!stageImagesRendered) {
      drawStage(g);
    }
    if (showFightLayer) {
      if (!runtimeUiReady) {
        drawHud(g, this.snapshot, this.matchSet);
      }
      drawFighterGroundingShadows(g, this.snapshot, {
        p1: this.visualSeparationOffset("p1"),
        p2: this.visualSeparationOffset("p2"),
      });
      const p1SpriteRendered = this.renderFighterSprite("p1", this.runtimeAssetFor("p1"));
      const p2SpriteRendered = this.renderFighterSprite("p2", this.runtimeAssetFor("p2"));
      if (!p1SpriteRendered) {
        drawFighter(g, this.snapshot.p1, 0x2ec4b6, this.simulation.hurtbox("p1"), this.simulation.activeHitboxes("p1"));
      }
      if (!p2SpriteRendered) {
        drawFighter(g, this.snapshot.p2, 0xff9f1c, this.simulation.hurtbox("p2"), this.simulation.activeHitboxes("p2"));
      }
    } else {
      this.fighterSprites.p1.setVisible(false);
      this.fighterSprites.p2.setVisible(false);
    }
    this.renderRuntimeUi(showFightLayer, runtimeUiReady);
    this.renderRuntimeUiMeters(showFightLayer && runtimeUiReady);
    this.renderEffectOverlay(showFightLayer);
    drawShellBackdrop(g, this.shell, stageImagesRendered, runtimeUiReady);
    this.renderShellOverlay();
    this.renderTouchControls();
    this.renderDamageNumbers(showFightLayer);
    this.statusText.setText(hudCenterLabel(this.snapshot, this.matchSet));
    this.roundText.setText(roundLabel(this.matchSet));
    if (this.shell.phase === "mode-select") {
      this.modeText
        .setText(modeSelectText(this.shell, this.cpuDifficulty))
        .setStyle({
          align: "center",
          color: "#f8f5e9",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "20px",
          fontStyle: "900",
          lineSpacing: 6,
        })
        .setOrigin(0.5, 0.5)
        .setPosition(512, 322)
        .setVisible(true);
    } else {
      this.modeText
        .setText(
          selectedPlayMode(this.shell) === "training"
              ? "TRAINING MODE"
            : selectedPlayMode(this.shell) === "championship"
              ? this.championshipModeText()
            : selectedPlayMode(this.shell) === "local-versus"
              ? "LOCAL VERSUS"
            : this.p2CpuEnabled
              ? `1 VS CPU ${this.cpuDifficulty.toUpperCase()}`
              : "P2 MANUAL",
        )
        .setStyle({
          align: "left",
          color: "#f8f5e9",
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: "12px",
          fontStyle: "700",
        })
        .setOrigin(0.5, 0)
        .setPosition(882, 82)
        .setVisible(showFightLayer);
    }
    this.statusText.setVisible(showFightLayer);
    this.roundText.setVisible(showFightLayer);
    this.p1NameText
      .setText(`${selectedFighter(this.selectedFighterIndex.p1).displayName.toUpperCase()}  POW ${powerStockLabel(this.snapshot.p1.meter)}`)
      .setVisible(showFightLayer);
    this.p2NameText
      .setText(`POW ${powerStockLabel(this.snapshot.p2.meter)}  ${selectedFighter(this.selectedFighterIndex.p2).displayName.toUpperCase()}`)
      .setVisible(showFightLayer);
    this.renderComboText(this.snapshot);
    this.renderShellText();
    this.renderChampionshipPresentation();
    this.renderTrainingPresentation();
    this.renderReadinessText();
    this.renderConceptArt();
    this.renderSelectSprites();
  }

  private createRuntimeUiImages(): Record<RuntimeUiImageSlot, Phaser.GameObjects.Image> {
    return Object.fromEntries(
      RUNTIME_UI_IMAGE_SPECS.map((spec) => {
        const asset = runtimeUiAssetConfig(spec.assetId);
        const image = this.add
          .image(spec.x, spec.y, asset.key)
          .setCrop(spec.crop.x, spec.crop.y, spec.crop.width, spec.crop.height)
          .setDisplaySize(spec.width, spec.height)
          .setDepth(spec.depth)
          .setVisible(false);
        return [spec.slot, image] as const;
      }),
    ) as Record<RuntimeUiImageSlot, Phaser.GameObjects.Image>;
  }

  private createTouchControlLabels(): Record<TouchControlId, Phaser.GameObjects.Text> {
    return Object.fromEntries(
      TOUCH_CONTROL_IDS.map((id) => [
        id,
        this.add
          .text(0, 0, "", {
            align: "center",
            color: "#fff7df",
            fontFamily: "Inter, Arial, sans-serif",
            fontSize: id === "start" ? "19px" : "13px",
            fontStyle: "900",
          })
          .setOrigin(0.5, 0.5)
          .setDepth(121)
          .setVisible(false),
      ]),
    ) as Record<TouchControlId, Phaser.GameObjects.Text>;
  }

  private installTouchInput(): void {
    this.input.addPointer(5);
    this.input.on("pointerdown", this.handleTouchPointer, this);
    this.input.on("pointermove", this.handleTouchPointer, this);
    this.input.on("pointerup", this.releaseTouchPointer, this);
    this.input.on("pointerupoutside", this.releaseTouchPointer, this);
  }

  private renderRuntimeUi(showFightLayer: boolean, runtimeUiReady: boolean): void {
    for (const image of Object.values(this.runtimeUiImages)) {
      image.setVisible(false);
    }
    for (const sprite of Object.values(this.hudPortraitSprites)) {
      sprite.setVisible(false);
    }
    if (!runtimeUiReady) return;

    const logo = this.runtimeUiImages["title-logo"];
    if (this.shell.phase === "ready") {
      logo.setPosition(512, 194).setDisplaySize(690, 388).setVisible(true);
    } else if (this.shell.phase === "mode-select" || this.shell.phase === "select") {
      logo.setPosition(512, 58).setDisplaySize(280, 158).setVisible(true);
    }

    if (showFightLayer) {
      for (const slot of [
        "hud-frame",
        "health-bar-rabbit",
        "health-bar-cat",
        "super-meter",
        "timer-frame",
      ] as const) {
        this.runtimeUiImages[slot].setVisible(true);
      }
      for (const player of ["p1", "p2"] as const) {
        const staticSlot = this.staticHudPortraitSlot(player);
        if (staticSlot) {
          this.runtimeUiImages[staticSlot].setVisible(true);
        }
      }
      this.renderHudPortraitSprites(true);
    }

    const overlaySlot = this.runtimeOverlaySlot();
    if (overlaySlot) {
      this.runtimeUiImages[overlaySlot].setVisible(true);
    }
  }

  private renderRuntimeUiMeters(showRuntimeUi: boolean): void {
    const graphics = this.children.getByName(this.runtimeUiMeterGraphicsKey) as Phaser.GameObjects.Graphics | null;
    const g = graphics ?? this.add.graphics();
    if (!graphics) {
      g.setName(this.runtimeUiMeterGraphicsKey);
      g.setDepth(88);
    }

    g.clear();
    if (!showRuntimeUi) return;

    drawRuntimeHudMeters(g, this.snapshot, this.matchSet);
  }

  private renderShellOverlay(): void {
    const graphics = this.children.getByName(this.shellOverlayGraphicsKey) as Phaser.GameObjects.Graphics | null;
    const g = graphics ?? this.add.graphics();
    if (!graphics) {
      g.setName(this.shellOverlayGraphicsKey);
      g.setDepth(94);
    }

    g.clear();
    if (this.championshipPresentationState().visible) {
      drawChampionshipPresentationPanel(g);
    }
    if (this.trainingPresentationState().visible) {
      drawTrainingPresentationPanel(g);
    }
    if (this.shell.phase === "paused") {
      drawPauseOptionsPanel(g);
    }
  }

  private renderTouchControls(): void {
    const graphics = this.children.getByName(this.touchControlsGraphicsKey) as Phaser.GameObjects.Graphics | null;
    const g = graphics ?? this.add.graphics();
    if (!graphics) {
      g.setName(this.touchControlsGraphicsKey);
      g.setDepth(120);
    }

    g.clear();
    for (const label of Object.values(this.touchControlLabels)) {
      label.setVisible(false);
    }

    if (!this.shouldShowTouchControls()) {
      this.pointerTouchControls.clear();
      this.syncActiveTouchControls();
      return;
    }

    for (const zone of this.touchControlZones()) {
      const active = this.activeTouchControls.has(zone.id);
      const chrome = touchControlChrome({
        id: zone.id,
        group: zone.group,
        active,
        width: zone.width,
        height: zone.height,
      });
      drawTouchControlSurface(g, zone, chrome);

      this.touchControlLabels[zone.id]
        .setText(chrome.glyph)
        .setFontSize(zone.id === "start" ? 20 : zone.group === "system" ? 13 : Math.min(zone.width, zone.height) >= 70 ? 12 : 10)
        .setPosition(zone.x + zone.width / 2, zone.y + zone.height / 2)
        .setAlpha(active ? 1 : 0.84)
        .setVisible(true);
    }
  }

  private handleTouchPointer(pointer: Phaser.Input.Pointer): void {
    if (!this.shouldShowTouchControls() || !pointer.isDown) return;

    const control = touchControlAtPoint(this.touchControlZones(), { x: pointer.x, y: pointer.y });
    if (control) {
      this.pointerTouchControls.set(pointer.id, control);
    } else {
      this.pointerTouchControls.delete(pointer.id);
    }
    this.syncActiveTouchControls();
  }

  private releaseTouchPointer(pointer: Phaser.Input.Pointer): void {
    this.pointerTouchControls.delete(pointer.id);
    this.syncActiveTouchControls();
  }

  private syncActiveTouchControls(): void {
    this.activeTouchControls = new Set(this.pointerTouchControls.values());
  }

  private shouldShowTouchControls(): boolean {
    return touchControlsVisibleForViewport(this.touchViewport(), this.coarsePointerActive());
  }

  private touchControlZones(): ReturnType<typeof touchControlZonesForPhase> {
    return touchControlZonesForPhase(this.shell.phase, this.touchControlLayout());
  }

  private touchControlLayout(): TouchControlLayout {
    return touchControlLayoutForViewport(this.touchViewport(), this.coarsePointerActive());
  }

  private touchViewport(): { width: number; height: number } {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  private coarsePointerActive(): boolean {
    return (window.matchMedia?.("(pointer: coarse)")?.matches ?? false) || navigator.maxTouchPoints > 0;
  }

  private runtimeOverlaySlot(): RuntimeUiImageSlot | null {
    if (
      this.shell.phase === "fighting" &&
      this.snapshot.status === "fighting" &&
      this.snapshot.frame < 42 &&
      !this.demoMode
    ) {
      return "fight-overlay";
    }

    if (this.shell.phase === "round-over" || this.shell.phase === "match-over") {
      if (this.shellPhaseFrame < 54) return "ko-overlay";
      if (!this.snapshot.winner || this.snapshot.winner === "draw") return "ko-overlay";
      return this.victoryOverlaySlot(this.snapshot.winner);
    }

    if (this.shell.phase === "fighting" && this.snapshot.status === "round-over") {
      return "ko-overlay";
    }

    return null;
  }

  private victoryOverlaySlot(winner: "p1" | "p2"): RuntimeUiImageSlot {
    const winnerFighter = selectedFighter(this.selectedFighterIndex[winner]);
    if (winnerFighter.id === "gray-rabbit") return "rabbit-win-overlay";
    if (winnerFighter.id === "ginger-tabby-cat") return "cat-win-overlay";
    return "ko-overlay";
  }

  private canRenderRuntimeUi(): boolean {
    return RUNTIME_UI_ASSETS.length > 0 && RUNTIME_UI_ASSETS.every((asset) => this.textures.exists(asset.key));
  }

  private renderStageLayers(showFightLayer: boolean): boolean {
    const imageLayerCount = this.stageRuntimeLayers.filter((layer) => layer.kind === "image-layer").length;
    const canRenderImages =
      showFightLayer &&
      imageLayerCount > 0 &&
      this.stageLayerImages.length === imageLayerCount &&
      this.stageLayerImages.every(({ image }) => this.textures.exists(image.texture.key));

    for (const { layer, image } of this.stageLayerImages) {
      const parallaxOffset = canRenderImages ? this.stageParallaxOffset(layer.parallax) : 0;
      image.setPosition(512 + parallaxOffset, 288);
      image.setVisible(canRenderImages);
    }

    return canRenderImages;
  }

  private stageParallaxOffset(parallax: number): number {
    const fightCenter = (this.snapshot.p1.x + this.snapshot.p2.x) / 2;
    const cameraDrift = Phaser.Math.Clamp((512 - fightCenter) * 0.05, -20, 20);
    const ambientDrift = Math.sin(this.shellFrame / 150) * 5;

    return cameraDrift * (1 - parallax) + ambientDrift * parallax * 0.18;
  }

  private createConceptPreview(player: "p1" | "p2"): Phaser.GameObjects.Image | null {
    if (!CONCEPT_SHEET) return null;

    const crop = CONCEPT_SHEET.previewCrops[player];
    const placement = player === "p1" ? { x: 360, y: 354 } : { x: 664, y: 354 };
    return this.add
      .image(placement.x, placement.y, CONCEPT_SHEET.key)
      .setCrop(crop.x, crop.y, crop.width, crop.height)
      .setDisplaySize(170, 230)
      .setDepth(99)
      .setVisible(false);
  }

  private initialSpriteKey(player: "p1" | "p2"): string {
    const assetKey = this.selectIdleAssetKey(player);
    if (assetKey) return assetKey;

    const fallback = RUNTIME_SPRITESHEETS[0]?.key;
    if (!fallback) {
      throw new Error("Game config requires at least one runtime spritesheet.");
    }
    return fallback;
  }

  private canRenderStageArt(): boolean {
    return this.stageRuntimeLayers.some((layer) => layer.kind === "image-layer");
  }

  private renderEffectOverlay(showFightLayer: boolean): void {
    const graphics = this.children.getByName(this.effectsGraphicsKey) as Phaser.GameObjects.Graphics | null;
    const g = graphics ?? this.add.graphics();
    if (!graphics) {
      g.setName(this.effectsGraphicsKey);
      g.setDepth(70);
    }

    g.clear();
    if (!showFightLayer) return;

    drawActionEffects(g, this.snapshot, {
      p1: this.visualSeparationOffset("p1"),
      p2: this.visualSeparationOffset("p2"),
    });
    drawEffects(g, this.effects);
    drawImpactFlash(g, this.impactFlash);
  }

  private renderDamageNumbers(showFightLayer: boolean): void {
    while (this.damageNumberTexts.length < this.damageNumbers.length) {
      this.damageNumberTexts.push(this.createDamageNumberText());
    }

    for (const text of this.damageNumberTexts) {
      text.setVisible(false);
    }

    if (!showFightLayer) return;

    for (const [index, number] of this.damageNumbers.entries()) {
      const text = this.damageNumberTexts[index];
      if (!text) continue;

      const style = damageNumberStyleForMove(number.kind === "super" ? "super" : number.kind === "special" ? "special" : number.kind === "heavy" ? "heavy" : "light");
      const progress = Phaser.Math.Clamp(number.age / number.duration, 0, 1);
      const rise = number.age * 1.32;
      const pop = 1 + Math.max(0, 1 - progress * 2.4) * 0.22;
      const stackOffset = Math.min(index, 3) * 18;
      text
        .setText(`-${number.value}`)
        .setStyle({
          color: style.color,
          fontFamily: "Inter, Arial, sans-serif",
          fontSize: `${style.fontSize}px`,
          fontStyle: "900",
          stroke: style.stroke,
          strokeThickness: 5,
        })
        .setPosition(number.x + number.driftX * number.age, number.y - rise - stackOffset)
        .setAlpha(Math.max(0, 1 - progress))
        .setScale(style.scale * pop)
        .setVisible(true);
    }
  }

  private createDamageNumberText(): Phaser.GameObjects.Text {
    return this.add
      .text(0, 0, "", {
        align: "center",
        color: "#fff7df",
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "900",
        stroke: "#12332d",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0.5)
      .setShadow(0, 2, "#000000", 4, true, true)
      .setDepth(112)
      .setVisible(false);
  }

  private createSimulation(): FightingSimulation {
    const playMode = selectedPlayMode(this.shell);
    return new FightingSimulation({
      p1Definition: selectedFighter(this.selectedFighterIndex.p1),
      p2Definition: selectedFighter(this.selectedFighterIndex.p2),
      trainingMode: playMode === "training",
    });
  }

  private startSelectedMatch(options: { syncCpuToMode?: boolean } = {}): void {
    if (options.syncCpuToMode ?? true) {
      this.p2CpuEnabled = playModeUsesCpu(this.shell);
    }
    if (selectedPlayMode(this.shell) === "championship") {
      if (this.championshipLadder.status !== "in-progress") {
        this.startChampionshipLadder();
      }
      this.syncChampionshipOpponentSelection();
      this.p2CpuEnabled = true;
    } else {
      this.championshipLadder = inactiveChampionshipLadder();
    }
    this.simulation = this.createSimulation();
    this.snapshot = this.simulation.snapshot();
    this.matchSet = createMatchSet();
    this.effects = [];
    this.damageNumbers = [];
    this.impactFlash = null;
  }

  private runtimeAssetFor(player: "p1" | "p2"): FighterRuntimeAsset {
    const fighter = this.snapshot[player];
    const manifest = manifestForCharacter(fighter.character);
    const presentationAnimation = this.presentationAnimationFor(player);
    if (presentationAnimation) {
      return resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, presentationAnimation));
    }

    return resolveManifestRuntimeAssetForSnapshot(manifest, fighter);
  }

  private presentationAnimationFor(player: "p1" | "p2"): FighterAnimationId | null {
    if (
      (this.shell.phase === "round-over" || this.shell.phase === "match-over") &&
      this.snapshot.winner === player
    ) {
      return "win";
    }
    if (
      (this.shell.phase === "round-over" || this.shell.phase === "match-over") &&
      this.snapshot.winner &&
      this.snapshot.winner !== "draw"
    ) {
      return "lose";
    }
    if (this.demoMode === "win" && player === "p1") {
      return "win";
    }
    return null;
  }

  private renderFighterSprite(player: "p1" | "p2", runtimeAsset: FighterRuntimeAsset): boolean {
    const sprite = this.fighterSprites[player];
    if (runtimeAsset.kind !== "sprite" || !this.textures.exists(runtimeAsset.assetKey)) {
      sprite.setVisible(false);
      this.lastFighterSpriteScales[player] = 1;
      return false;
    }

    const fighter = this.snapshot[player];
    const poseFrame = fighter.guarding && fighter.state === "idle" ? 0 : fighter.stateFrame;
    const pose = selectSpritePose(runtimeAsset.animationId, poseFrame, runtimeAsset.frameCount);
    const visualScale = this.spriteVisualScaleFor(runtimeAsset.assetKey, pose.frame);
    const visualOffsetX = this.visualSeparationOffset(player);
    this.lastFighterSpriteScales[player] = visualScale;
    sprite
      .setTexture(runtimeAsset.assetKey)
      .setFrame(pose.frame)
      .setPosition(fighter.x + visualOffsetX + pose.offsetX * fighter.facing, fighter.y + 6 + pose.offsetY)
      .setFlipX(fighter.facing < 0)
      .setScale(1.15 * pose.scaleX * visualScale, 1.15 * pose.scaleY * visualScale)
      .setRotation(Phaser.Math.DegToRad(pose.rotation * fighter.facing))
      .setVisible(true);
    return true;
  }

  private buildSpriteVisualScaleMap(): Map<string, readonly number[]> {
    const scaleMap = new Map<string, readonly number[]>();
    for (const manifest of FIGHTER_ASSET_MANIFESTS) {
      const idleAsset = resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, "idle"));
      if (idleAsset.kind !== "sprite" || !this.textures.exists(idleAsset.assetKey)) continue;

      const referenceArea = spriteReferenceArea(this.frameVisualBoundsForAsset(idleAsset));
      for (const animation of manifest.animations) {
        const runtimeAsset = resolveFighterRuntimeAsset(renderAssetForAnimationId(manifest, animation.id));
        if (runtimeAsset.kind !== "sprite" || !this.textures.exists(runtimeAsset.assetKey)) continue;

        const bounds = this.frameVisualBoundsForAsset(runtimeAsset);
        scaleMap.set(
          runtimeAsset.assetKey,
          bounds.map((bound) => spriteVisualScaleForBounds(bound, referenceArea)),
        );
      }
    }

    return scaleMap;
  }

  private spriteVisualScaleFor(assetKey: string, frame: number): number {
    return this.spriteVisualScales.get(assetKey)?.[frame] ?? 1;
  }

  private frameVisualBoundsForAsset(asset: RuntimeSpriteAsset): readonly SpriteFrameVisualBounds[] {
    const fallback = Array.from({ length: asset.frameCount }, () => ({
      width: asset.frameWidth,
      height: asset.frameHeight,
    }));
    if (!this.textures.exists(asset.assetKey)) return fallback;

    const canvas = document.createElement("canvas");
    const sheetWidth = asset.frameCount * asset.frameWidth;
    canvas.width = sheetWidth;
    canvas.height = asset.frameHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return fallback;

    try {
      context.drawImage(
        this.textures.get(asset.assetKey).getSourceImage() as CanvasImageSource,
        0,
        0,
        sheetWidth,
        asset.frameHeight,
      );
    } catch {
      return fallback;
    }

    const pixels = context.getImageData(0, 0, sheetWidth, asset.frameHeight).data;
    return Array.from({ length: asset.frameCount }, (_, frame) =>
      frameVisualBoundsFromPixels(pixels, {
        sheetWidth,
        frameX: frame * asset.frameWidth,
        frameWidth: asset.frameWidth,
        frameHeight: asset.frameHeight,
      }),
    );
  }

  private visualSeparationOffset(player: "p1" | "p2"): number {
    const fighter = this.snapshot[player];
    const opponent = this.snapshot[player === "p1" ? "p2" : "p1"];
    return fighterVisualSeparationOffset(fighter, opponent);
  }

  private handleCharacterSelectInput(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.p1Left)) {
      this.cycleSelectedFighter("p1", -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.p1Right) || Phaser.Input.Keyboard.JustDown(this.keys.p1RightAlt)) {
      this.cycleSelectedFighter("p1", 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.p2Left)) {
      this.cycleSelectedFighter("p2", -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.p2Right)) {
      this.cycleSelectedFighter("p2", 1);
    }
  }

  private cycleSelectedFighter(player: "p1" | "p2", direction: -1 | 1): void {
    const next = this.selectedFighterIndex[player] + direction;
    this.selectedFighterIndex[player] = (next + FIGHTER_ROSTER.length) % FIGHTER_ROSTER.length;
    this.championshipLadder = inactiveChampionshipLadder();
    this.simulation = this.createSimulation();
    this.snapshot = this.simulation.snapshot();
  }

  private startChampionshipLadder(): void {
    const playerFighterId = selectedFighter(this.selectedFighterIndex.p1).id;
    const selectedOpponentId = selectedFighter(this.selectedFighterIndex.p2).id;
    const remainingOpponentIds = FIGHTER_ROSTER.map((fighter) => fighter.id).filter((fighterId) => fighterId !== playerFighterId);
    const opponentIds =
      selectedOpponentId !== playerFighterId && remainingOpponentIds.includes(selectedOpponentId)
        ? [selectedOpponentId, ...remainingOpponentIds.filter((fighterId) => fighterId !== selectedOpponentId)]
        : remainingOpponentIds;

    this.championshipLadder = {
      status: opponentIds.length > 0 ? "in-progress" : "complete",
      result: opponentIds.length > 0 ? null : "cleared",
      playerFighterId,
      opponentIds,
      opponentIndex: 0,
      completedOpponentIds: [],
    };
  }

  private recordChampionshipMatchOutcome(): void {
    if (selectedPlayMode(this.shell) !== "championship" || this.championshipLadder.status !== "in-progress") return;

    const currentOpponentId = this.championshipCurrentOpponentId();
    if (this.matchSet.matchWinner !== "p1") {
      this.championshipLadder = {
        ...this.championshipLadder,
        status: "complete",
        result: "failed",
      };
      return;
    }

    const completedOpponentIds = currentOpponentId
      ? [...this.championshipLadder.completedOpponentIds, currentOpponentId]
      : [...this.championshipLadder.completedOpponentIds];
    const nextOpponentIndex = this.championshipLadder.opponentIndex + 1;
    const ladderCleared = nextOpponentIndex >= this.championshipLadder.opponentIds.length;
    this.championshipLadder = {
      ...this.championshipLadder,
      status: ladderCleared ? "complete" : "in-progress",
      result: ladderCleared ? "cleared" : null,
      opponentIndex: ladderCleared ? this.championshipLadder.opponentIndex : nextOpponentIndex,
      completedOpponentIds,
    };
  }

  private prepareChampionshipNextMatch(): void {
    if (this.championshipLadder.status !== "in-progress") {
      this.startChampionshipLadder();
    }
    this.syncChampionshipOpponentSelection();
    this.simulation = this.createSimulation();
    this.p2CpuEnabled = true;
  }

  private syncChampionshipOpponentSelection(): void {
    const opponentId = this.championshipCurrentOpponentId();
    if (!opponentId) return;

    this.selectedFighterIndex.p2 = fighterRosterIndex(opponentId);
  }

  private championshipCurrentOpponentId(): string | null {
    if (this.championshipLadder.status !== "in-progress") return null;
    return this.championshipLadder.opponentIds[this.championshipLadder.opponentIndex] ?? null;
  }

  private championshipLadderTextState() {
    const currentOpponentId = this.championshipCurrentOpponentId();
    const completed = this.championshipLadder.completedOpponentIds.map((fighterId) => fighterSummary(fighterId));
    const opponents = this.championshipLadder.opponentIds.map((fighterId) => fighterSummary(fighterId));
    const remaining = this.championshipLadder.opponentIds
      .slice(this.championshipLadder.status === "in-progress" ? this.championshipLadder.opponentIndex : this.championshipLadder.opponentIds.length)
      .map((fighterId) => fighterSummary(fighterId));

    return {
      status: this.championshipLadder.status,
      result: this.championshipLadder.result,
      player: this.championshipLadder.playerFighterId ? fighterSummary(this.championshipLadder.playerFighterId) : null,
      currentOpponent: currentOpponentId ? fighterSummary(currentOpponentId) : null,
      currentOpponentNumber: this.championshipLadder.status === "in-progress" ? this.championshipLadder.opponentIndex + 1 : null,
      totalOpponents: this.championshipLadder.opponentIds.length,
      completedOpponents: completed,
      remainingOpponents: remaining,
      opponentOrder: opponents,
      label: championshipLadderLabel(this.championshipLadder, currentOpponentId),
    };
  }

  private championshipPresentationState() {
    const visible =
      selectedPlayMode(this.shell) === "championship" &&
      (this.shell.phase === "fighting" || this.shell.phase === "round-over" || this.shell.phase === "match-over");
    const currentOpponentId = this.championshipCurrentOpponentId();
    const currentRival = currentOpponentId ? fighterStorySummary(currentOpponentId) : null;
    const player = this.championshipLadder.playerFighterId
      ? fighterStorySummary(this.championshipLadder.playerFighterId)
      : fighterStorySummary(selectedFighter(this.selectedFighterIndex.p1).id);
    const completedRivals = this.championshipLadder.completedOpponentIds.map((fighterId) => fighterStorySummary(fighterId));
    const lastCompletedRival = completedRivals[completedRivals.length - 1] ?? null;
    const opponentOrder = this.championshipLadder.opponentIds.map((fighterId, index) => {
      const rival = fighterStorySummary(fighterId);
      const marker = this.championshipLadder.completedOpponentIds.includes(fighterId)
        ? "DONE"
        : fighterId === currentOpponentId
          ? "NEXT"
          : `R${index + 1}`;
      return {
        ...rival,
        marker,
      };
    });
    const opponentOrderLabel =
      opponentOrder.length > 0
        ? `Order: ${opponentOrder.map((opponent) => `${opponent.marker} ${opponent.displayName}`).join(" > ")}`
        : "";
    const progress = {
      completedCount: completedRivals.length,
      totalOpponents: this.championshipLadder.opponentIds.length,
    };

    if (!visible) {
      const callToAction = "";
      return {
        visible: false,
        headline: "",
        body: "",
        callToAction,
        opponentOrderLabel,
        player,
        currentRival,
        completedRivals,
        lastCompletedRival,
        opponentOrder,
        result: this.championshipLadder.result,
        reward: championshipRewardState("intro", progress, player, currentRival),
        interstitial: championshipInterstitialState("intro", progress, player, currentRival, lastCompletedRival, callToAction),
      };
    }

    if (this.championshipLadder.status === "complete" && this.championshipLadder.result === "cleared") {
      const callToAction = "Enter: restart ladder";
      return {
        visible,
        headline: "SNACKBELT CLEARED",
        body: `${player.displayName} survives ${completedRivals.map((rival) => rival.displayName).join(" and ")}. The treat belt is now legally theirs until somebody licks the paperwork.`,
        callToAction,
        opponentOrderLabel,
        player,
        currentRival: null,
        completedRivals,
        lastCompletedRival,
        opponentOrder,
        result: this.championshipLadder.result,
        reward: championshipRewardState("cleared", progress, player, currentRival),
        interstitial: championshipInterstitialState("cleared", progress, player, currentRival, lastCompletedRival, callToAction),
      };
    }

    if (this.championshipLadder.status === "complete" && this.championshipLadder.result === "failed") {
      const winner = this.snapshot.winner && this.snapshot.winner !== "draw" ? selectedFighter(this.selectedFighterIndex[this.snapshot.winner]).id : null;
      const spoiler = winner ? fighterStorySummary(winner) : null;
      const callToAction = "Enter: retry ladder";
      return {
        visible,
        headline: "SNACKBELT RUN ENDED",
        body: spoiler
          ? `${spoiler.displayName} stops the run. ${spoiler.storyHook ?? "The bracket refuses to elaborate."}`
          : "The bracket stops the run in deeply suspicious circumstances.",
        callToAction,
        opponentOrderLabel,
        player,
        currentRival: null,
        completedRivals,
        lastCompletedRival,
        opponentOrder,
        result: this.championshipLadder.result,
        reward: championshipRewardState("failed", progress, player, spoiler),
        interstitial: championshipInterstitialState("failed", progress, player, spoiler, lastCompletedRival, callToAction),
      };
    }

    if (this.shell.phase === "match-over" && lastCompletedRival && currentRival) {
      const callToAction = "Enter: next fight";
      return {
        visible,
        headline: "ADVANCE TO NEXT RIVAL",
        body: `${lastCompletedRival.displayName} is down. Next: ${currentRival.displayName} - ${currentRival.storyHook ?? "The bracket has chosen chaos."}`,
        callToAction,
        opponentOrderLabel,
        player,
        currentRival,
        completedRivals,
        lastCompletedRival,
        opponentOrder,
        result: this.championshipLadder.result,
        reward: championshipRewardState("advance", progress, player, currentRival),
        interstitial: championshipInterstitialState("advance", progress, player, currentRival, lastCompletedRival, callToAction),
      };
    }

    if (currentRival) {
      const callToAction = "Win the set to advance";
      return {
        visible,
        headline: `SNACKBELT LADDER ${this.championshipLadder.opponentIndex + 1}/${this.championshipLadder.opponentIds.length}`,
        body: `Current rival: ${currentRival.displayName} - ${currentRival.storyHook ?? "The bracket has chosen chaos."}`,
        callToAction,
        opponentOrderLabel,
        player,
        currentRival,
        completedRivals,
        lastCompletedRival,
        opponentOrder,
        result: this.championshipLadder.result,
        reward: championshipRewardState("rival-preview", progress, player, currentRival),
        interstitial: championshipInterstitialState("rival-preview", progress, player, currentRival, lastCompletedRival, callToAction),
      };
    }

    const callToAction = "Enter: fight";
    return {
      visible,
      headline: "SNACKBELT LADDER",
      body: GAME_CONFIG.contentSpine.championship.premise,
      callToAction,
      opponentOrderLabel,
      player,
      currentRival,
      completedRivals,
      lastCompletedRival,
      opponentOrder,
      result: this.championshipLadder.result,
      reward: championshipRewardState("intro", progress, player, currentRival),
      interstitial: championshipInterstitialState("intro", progress, player, currentRival, lastCompletedRival, callToAction),
    };
  }

  private trainingTextState() {
    const enabled = selectedPlayMode(this.shell) === "training";
    if (!enabled) {
      return {
        enabled: false,
        endlessRound: false,
        selectedFighter: null,
        dummy: null,
        practice: null,
        presentation: null,
      };
    }

    const selectedFighterProfile = this.selectedFighterProfile("p1");
    const dummyProfile = this.selectedFighterProfile("p2");
    return {
      enabled: true,
      endlessRound: true,
      selectedFighter: selectedFighterProfile,
      dummy: {
        fighterId: dummyProfile.fighterId,
        displayName: dummyProfile.displayName,
        behavior: "manual idle sparring dummy",
        healthLocked: true,
        currentState: this.snapshot.p2.state,
        health: this.snapshot.p2.health,
        guarding: this.snapshot.p2.guarding,
        statusLabel: trainingDummyStatusLabel(this.snapshot.p2),
      },
      practice: {
        comboCount: this.snapshot.combo.count,
        comboDamage: this.snapshot.combo.damage,
        currentAction: trainingActionLabel(this.snapshot.p1),
        currentState: this.snapshot.p1.state,
        resetHint: "R resets to ready",
        inputHints: ["Space/J light", "I kick", "K heavy", "L special", "S,D,L super"],
      },
      presentation: this.trainingPresentationState(),
    };
  }

  private localVersusTextState(selectedFighterDetails: { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile }) {
    const enabled = selectedPlayMode(this.shell) === "local-versus";
    return {
      enabled,
      controlPlan: "same-keyboard",
      p2Mode: enabled ? (this.p2CpuEnabled ? "unexpected-cpu" : "manual") : null,
      runtimeRosterTruth: selectFooterLine(this.assetReadiness),
      p1: enabled ? selectedFighterDetails.p1 : null,
      p2: enabled ? selectedFighterDetails.p2 : null,
      inputHints: enabled
        ? {
            p1: ["A/D move", "W jump", "S crouch", "J/I/K/L attacks"],
            p2: ["Arrows move", "Numpad 1/4/2/3 attacks"],
          }
        : null,
    };
  }

  private browserSettingsTextState(selectedFighterDetails: { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile }) {
    const mode = selectedPlayMode(this.shell);
    const cpuBackedMode = playModeUsesCpu(this.shell);
    const p2Control = cpuBackedMode
      ? this.p2CpuEnabled
        ? `${this.cpuDifficulty.toUpperCase()} CPU`
        : "manual P2"
      : "manual P2";
    const p2Controls = mode === "local-versus" ? "P2 arrows + Numpad 1/4/2/3" : "P2 manual arrows + Numpad, or CPU";

    return {
      visible: this.shell.phase === "paused",
      surface: "browser-v1-options",
      keyboardFirst: true,
      orientation: GAME_CONFIG.contentSpine.platformPlan.browserV1.orientation,
      persistence: "session-only",
      keyRebinding: "not-in-browser-v1",
      mode: {
        id: mode,
        label: shellModeLabel(this.shell),
      },
      p1: {
        fighter: selectedFighterDetails.p1,
        controls: "P1 WASD + J/I/K/L",
      },
      p2: {
        fighter: selectedFighterDetails.p2,
        control: p2Control,
        controls: p2Controls,
      },
      cpu: {
        difficulty: this.cpuDifficulty,
        toggleAvailable: cpuBackedMode,
        levelAvailable: cpuBackedMode,
        summary: cpuBackedMode
          ? `C toggles CPU/manual, V changes level, current ${p2Control}`
          : "CPU locked off here; Local Versus keeps P2 manual",
      },
      actions: ["START / P / ESC resume", "R reset to ready", "F fullscreen", "No key rebinding in browser v1"],
    };
  }

  private browserSettingsHelpText(selectedFighterDetails: { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile }): string {
    const settings = this.browserSettingsTextState(selectedFighterDetails);
    const p2Controls = settings.mode.id === "local-versus" ? "P2 ARROWS + NUM 1/4/2/3" : "P2 ARROWS + NUM, OR CPU";
    const cpuLine = settings.cpu.toggleAvailable
      ? `CPU: ${settings.cpu.difficulty.toUpperCase()} / C TOGGLE / V LEVEL`
      : "CPU: OFF / LOCAL VERSUS MANUAL P2";
    return [
      "BROWSER OPTIONS",
      `MODE: ${settings.mode.label} / ${settings.p2.control.toUpperCase()}`,
      settings.p1.controls,
      p2Controls,
      cpuLine,
      "START / P / ESC RESUME  |  R RESET",
      "F FULLSCREEN  |  NO KEY REBINDING IN V1",
    ].join("\n");
  }

  private trainingPresentationState() {
    const visible =
      selectedPlayMode(this.shell) === "training" &&
      (this.shell.phase === "fighting" || this.shell.phase === "paused");
    const selectedFighterProfile = this.selectedFighterProfile("p1");
    const dummyProfile = this.selectedFighterProfile("p2");
    const dummyStatus = trainingDummyStatusLabel(this.snapshot.p2);
    const currentAction = trainingActionLabel(this.snapshot.p1);
    const comboLine = `${this.snapshot.combo.count} HIT / ${this.snapshot.combo.damage} DMG`;

    return {
      visible,
      headline: "TRAINING LAB",
      body: `${selectedFighterProfile.displayName}: ${selectedFighterProfile.trainingTip ?? "Practice spacing, confirms, and reset timing."}`,
      dummyLine: `Dummy: ${dummyProfile.displayName} / ${dummyStatus} / health lock on`,
      feedbackLine: `Feedback: ${comboLine} / ${currentAction}`,
      callToAction: "R: reset to ready",
      selectedFighter: selectedFighterProfile,
      dummy: {
        fighterId: dummyProfile.fighterId,
        displayName: dummyProfile.displayName,
        statusLabel: dummyStatus,
        healthLocked: true,
      },
      practice: {
        comboCount: this.snapshot.combo.count,
        comboDamage: this.snapshot.combo.damage,
        currentAction,
      },
    };
  }

  private championshipModeText(): string {
    return championshipLadderLabel(this.championshipLadder, this.championshipCurrentOpponentId()).toUpperCase();
  }

  private playerTwoInput(frame: number) {
    if (this.p2CpuEnabled) {
      return createCpuInput(this.snapshot, "p2", frame, { difficulty: this.cpuDifficulty });
    }

    return createInput(frame, {
      horizontal: keyDown(this.keys.p2Left) ? -1 : keyDown(this.keys.p2Right) ? 1 : 0,
      vertical: keyDown(this.keys.p2Down) ? 1 : keyDown(this.keys.p2Jump) ? -1 : 0,
      buttons: buttonsFromKeys({
        jump: keyDown(this.keys.p2Jump),
        crouch: keyDown(this.keys.p2Down),
        light: keyDown(this.keys.p2Light),
        kick: keyDown(this.keys.p2Kick),
        heavy: keyDown(this.keys.p2Heavy),
        special: keyDown(this.keys.p2Special),
        guard: keyDown(this.keys.p2Right),
      }),
    });
  }

  private playerOneInput(frame: number) {
    if (this.demoMode === "walk-forward") {
      return createInput(frame, {
        horizontal: 1,
        vertical: 0,
        buttons: buttonsFromKeys({}),
      });
    }
    if (this.demoMode === "walk-back") {
      return createInput(frame, {
        horizontal: -1,
        vertical: 0,
        buttons: buttonsFromKeys({ guard: true }),
      });
    }
    if (this.demoMode === "crouch") {
      return createInput(frame, {
        horizontal: 0,
        vertical: 1,
        buttons: buttonsFromKeys({ crouch: true }),
      });
    }
    if (this.demoMode === "light-punch") {
      return createInput(frame, {
        horizontal: 0,
        vertical: 0,
        buttons: buttonsFromKeys({ light: true }),
      });
    }
    if (this.demoMode === "light-kick") {
      return createInput(frame, {
        horizontal: 0,
        vertical: 0,
        buttons: buttonsFromKeys({ kick: true }),
      });
    }

    const touchInput = touchInputFromControls(this.activeTouchControls);
    const gamepadInput = this.readGamepadInput();
    if (this.suppressGamepadLightUntilReleased && !gamepadInput.buttons.light) {
      this.suppressGamepadLightUntilReleased = false;
    }
    if (this.suppressKeyboardLightUntilReleased && !keyDown(this.keys.p1LightAlt)) {
      this.suppressKeyboardLightUntilReleased = false;
    }
    if (this.suppressKeyboardSpecialUntilReleased && !keyDown(this.keys.p1SpecialAlt)) {
      this.suppressKeyboardSpecialUntilReleased = false;
    }
    const gamepadLight = this.suppressGamepadLightUntilReleased ? false : gamepadInput.buttons.light;
    const keyboardLight = keyDown(this.keys.p1Light) || (!this.suppressKeyboardLightUntilReleased && keyDown(this.keys.p1LightAlt));
    const keyboardSpecial =
      keyDown(this.keys.p1Special) || (!this.suppressKeyboardSpecialUntilReleased && keyDown(this.keys.p1SpecialAlt));
    const keyboardHorizontal = keyDown(this.keys.p1Left) ? -1 : keyDown(this.keys.p1Right) || keyDown(this.keys.p1RightAlt) ? 1 : 0;
    const keyboardVertical = keyDown(this.keys.p1Down) ? 1 : keyDown(this.keys.p1Jump) ? -1 : 0;
    const horizontal = touchInput.horizontal !== 0 ? touchInput.horizontal : gamepadInput.horizontal !== 0 ? gamepadInput.horizontal : keyboardHorizontal;
    const vertical = touchInput.vertical !== 0 ? touchInput.vertical : gamepadInput.vertical !== 0 ? gamepadInput.vertical : keyboardVertical;

    return createInput(frame, {
      horizontal,
      vertical,
      buttons: buttonsFromKeys({
        jump: keyDown(this.keys.p1Jump) || touchInput.buttons.jump || gamepadInput.buttons.jump,
        crouch: keyDown(this.keys.p1Down) || touchInput.buttons.crouch || gamepadInput.buttons.crouch,
        light: keyboardLight || touchInput.buttons.light || gamepadLight,
        kick: keyDown(this.keys.p1Kick) || touchInput.buttons.kick || gamepadInput.buttons.kick,
        heavy: keyDown(this.keys.p1Heavy) || touchInput.buttons.heavy || gamepadInput.buttons.heavy,
        special: keyboardSpecial || touchInput.buttons.special || gamepadInput.buttons.special,
        guard: keyDown(this.keys.p1Left) || touchInput.buttons.guard || gamepadInput.buttons.guard,
      }),
    });
  }

  private applyDemoMode(): void {
    if (
      this.demoMode !== "walk-forward" &&
      this.demoMode !== "walk-back" &&
      this.demoMode !== "crouch" &&
      this.demoMode !== "jump" &&
      this.demoMode !== "light-punch" &&
      this.demoMode !== "light-kick" &&
      this.demoMode !== "heavy-punch" &&
      this.demoMode !== "special" &&
      this.demoMode !== "super" &&
      this.demoMode !== "hop" &&
      this.demoMode !== "run-forward" &&
      this.demoMode !== "backdash" &&
      this.demoMode !== "roll-forward" &&
      this.demoMode !== "roll-back" &&
      this.demoMode !== "hitstun" &&
      this.demoMode !== "blockstun" &&
      this.demoMode !== "knockdown" &&
      this.demoMode !== "ko" &&
      this.demoMode !== "win" &&
      this.demoMode !== "cat-win" &&
      this.demoMode !== "championship-ladder-advance" &&
      this.demoMode !== "championship-ladder-clear" &&
      this.demoMode !== "championship-ladder-fail" &&
      this.demoMode !== "hud-low" &&
      !isCombatReadabilityDemoMode(this.demoMode)
    ) {
      return;
    }

    this.p2CpuEnabled = false;
    this.shell = { phase: "fighting" };
    this.startSelectedMatch({ syncCpuToMode: false });
    if (this.demoMode === "hitstun") {
      this.primeHitstunDemo();
    } else if (this.demoMode === "blockstun") {
      this.primeBlockstunDemo();
    } else if (this.demoMode === "jump") {
      this.primeJumpDemo();
    } else if (this.demoMode === "light-kick") {
      this.primeLightKickDemo();
    } else if (this.demoMode === "heavy-punch") {
      this.primeHeavyPunchDemo();
    } else if (this.demoMode === "special") {
      this.primeSpecialDemo();
    } else if (this.demoMode === "super") {
      this.primeSuperDemo();
    } else if (this.demoMode === "hop") {
      this.primeHopDemo();
    } else if (this.demoMode === "run-forward") {
      this.primeRunForwardDemo();
    } else if (this.demoMode === "backdash") {
      this.primeBackdashDemo();
    } else if (this.demoMode === "roll-forward") {
      this.primeRollDemo("rollForward");
    } else if (this.demoMode === "roll-back") {
      this.primeRollDemo("rollBack");
    } else if (this.demoMode === "knockdown") {
      this.primeKnockdownDemo();
    } else if (this.demoMode === "ko") {
      this.primeKoDemo();
    } else if (this.demoMode === "win") {
      this.primeWinDemo("p1");
    } else if (this.demoMode === "cat-win") {
      this.primeWinDemo("p2");
    } else if (this.demoMode === "championship-ladder-advance") {
      this.primeChampionshipLadderAdvanceDemo();
    } else if (this.demoMode === "championship-ladder-clear") {
      this.primeChampionshipLadderClearDemo();
    } else if (this.demoMode === "championship-ladder-fail") {
      this.primeChampionshipLadderFailDemo();
    } else if (this.demoMode === "hud-low") {
      this.primeHudLowDemo();
    } else if (this.demoMode && isCombatReadabilityDemoMode(this.demoMode)) {
      this.primeCombatReadabilityDemo(this.demoMode);
    }
  }

  private primeChampionshipLadderAdvanceDemo(): void {
    this.selectedFighterIndex = { p1: fighterRosterIndex("gray-rabbit"), p2: fighterRosterIndex("ginger-tabby-cat") };
    this.shell = { phase: "fighting", selectedMode: "championship" };
    this.startSelectedMatch({ syncCpuToMode: true });
    this.forceChampionshipMatchOver("p1", "ginger-tabby-cat");
    this.recordChampionshipMatchOutcome();
  }

  private primeChampionshipLadderClearDemo(): void {
    this.selectedFighterIndex = { p1: fighterRosterIndex("gray-rabbit"), p2: fighterRosterIndex("pugilist-pug") };
    this.shell = { phase: "fighting", selectedMode: "championship" };
    this.championshipLadder = {
      status: "in-progress",
      result: null,
      playerFighterId: "gray-rabbit",
      opponentIds: ["ginger-tabby-cat", "pugilist-pug"],
      opponentIndex: 1,
      completedOpponentIds: ["ginger-tabby-cat"],
    };
    this.startSelectedMatch({ syncCpuToMode: true });
    this.forceChampionshipMatchOver("p1", "pugilist-pug");
    this.recordChampionshipMatchOutcome();
  }

  private primeChampionshipLadderFailDemo(): void {
    this.selectedFighterIndex = { p1: fighterRosterIndex("gray-rabbit"), p2: fighterRosterIndex("ginger-tabby-cat") };
    this.shell = { phase: "fighting", selectedMode: "championship" };
    this.startSelectedMatch({ syncCpuToMode: true });
    this.forceChampionshipMatchOver("p2", "ginger-tabby-cat");
    this.recordChampionshipMatchOutcome();
  }

  private forceChampionshipMatchOver(winner: "p1" | "p2", opponentId: string): void {
    this.selectedFighterIndex.p2 = fighterRosterIndex(opponentId);
    this.simulation = this.createSimulation();
    const snapshot = this.simulation.snapshot();
    this.matchSet = {
      ...createMatchSet(),
      round: 2,
      wins: winner === "p1" ? { p1: 2, p2: 0 } : { p1: 0, p2: 2 },
      lastRoundWinner: winner,
      matchWinner: winner,
      status: "complete",
    };
    this.shell = { phase: "match-over", selectedMode: "championship" };
    this.shellPhaseFrame = 72;
    this.snapshot = {
      ...snapshot,
      frame: 900,
      status: "round-over",
      winner,
      p1: {
        ...snapshot.p1,
        x: winner === "p1" ? 500 : 360,
        meter: winner === "p1" ? POWER_METER_STOCK : Math.floor(POWER_METER_STOCK / 3),
        state: winner === "p1" ? "idle" : "knockdown",
        stateFrame: winner === "p1" ? 40 : 36,
        hitstop: 0,
        health: winner === "p1" ? 740 : 0,
      },
      p2: {
        ...snapshot.p2,
        x: winner === "p1" ? 710 : 560,
        meter: winner === "p1" ? Math.floor(POWER_METER_STOCK / 3) : POWER_METER_STOCK,
        state: winner === "p1" ? "knockdown" : "idle",
        stateFrame: winner === "p1" ? 36 : 40,
        hitstop: 0,
        health: winner === "p1" ? 0 : 760,
      },
    };
  }

  private primeHeavyPunchDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 560,
        state: "heavyAttack",
        stateFrame: 14,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 722,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeLightKickDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 560,
        state: "lightKick",
        stateFrame: 10,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 716,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeJumpDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 430,
        y: 344,
        state: "jump",
        stateFrame: 18,
        grounded: false,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 690,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeSpecialDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 560,
        state: "specialAttack",
        stateFrame: 18,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 722,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeSuperDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 540,
        meter: POWER_METER_STOCK,
        state: "superAttack",
        stateFrame: 24,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 722,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeHopDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 444,
        y: 388,
        state: "hop",
        stateFrame: 11,
        grounded: false,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 690,
        state: "idle",
        stateFrame: 0,
        health: 1000,
      },
    };
  }

  private primeRunForwardDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 488,
        state: "runForward",
        stateFrame: 12,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 724,
        state: "idle",
        stateFrame: 0,
      },
    };
  }

  private primeBackdashDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 520,
        state: "backdash",
        stateFrame: 8,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 724,
        state: "idle",
        stateFrame: 0,
      },
    };
  }

  private primeRollDemo(state: "rollForward" | "rollBack"): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: state === "rollForward" ? 612 : 604,
        state,
        stateFrame: 12,
        hitstop: 0,
        guarding: false,
      },
      p2: {
        ...this.snapshot.p2,
        x: 724,
        state: "idle",
        stateFrame: 0,
      },
    };
  }

  private primeKnockdownDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      p1: {
        ...this.snapshot.p1,
        x: 520,
        state: "idle",
        stateFrame: 0,
        hitstop: 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: 690,
        state: "knockdown",
        stateFrame: 36,
        hitstop: 0,
        health: 0,
      },
    };
  }

  private primeKoDemo(): void {
    this.shell = { phase: "round-over" };
    this.shellPhaseFrame = 24;
    this.matchSet = {
      ...this.matchSet,
      round: 2,
      wins: { p1: 1, p2: 0 },
      lastRoundWinner: "p1",
      matchWinner: null,
      status: "in-progress",
    };
    this.snapshot = {
      ...this.snapshot,
      frame: 720,
      roundTimer: 0,
      status: "round-over",
      winner: "p1",
      p1: {
        ...this.snapshot.p1,
        x: 430,
        meter: POWER_METER_STOCK,
        state: "idle",
        stateFrame: 24,
        hitstop: 0,
        health: 420,
      },
      p2: {
        ...this.snapshot.p2,
        x: 650,
        meter: POWER_METER_STOCK / 2,
        state: "knockdown",
        stateFrame: 36,
        hitstop: 0,
        health: 0,
      },
    };
  }

  private primeWinDemo(winner: "p1" | "p2"): void {
    const p1Won = winner === "p1";
    this.shell = { phase: "match-over" };
    this.shellPhaseFrame = 72;
    this.matchSet = {
      ...this.matchSet,
      round: 2,
      wins: p1Won ? { p1: this.matchSet.targetWins, p2: 0 } : { p1: 0, p2: this.matchSet.targetWins },
      lastRoundWinner: winner,
      matchWinner: winner,
      status: "complete",
    };
    this.snapshot = {
      ...this.snapshot,
      frame: 900,
      status: "round-over",
      winner,
      p1: {
        ...this.snapshot.p1,
        x: p1Won ? 500 : 360,
        meter: p1Won ? POWER_METER_STOCK : Math.floor(POWER_METER_STOCK / 3),
        state: p1Won ? "idle" : "knockdown",
        stateFrame: p1Won ? 40 : 36,
        hitstop: 0,
        health: p1Won ? 740 : 0,
      },
      p2: {
        ...this.snapshot.p2,
        x: p1Won ? 710 : 560,
        meter: p1Won ? Math.floor(POWER_METER_STOCK / 3) : POWER_METER_STOCK,
        state: p1Won ? "knockdown" : "idle",
        stateFrame: p1Won ? 36 : 40,
        hitstop: 0,
        health: p1Won ? 0 : 760,
      },
    };
  }

  private primeHudLowDemo(): void {
    this.snapshot = {
      ...this.snapshot,
      frame: 960,
      roundTimer: 42,
      status: "fighting",
      winner: null,
      p1: {
        ...this.snapshot.p1,
        x: 390,
        meter: POWER_METER_STOCK + POWER_METER_STOCK / 2,
        state: "idle",
        stateFrame: 24,
        hitstop: 0,
        health: 280,
      },
      p2: {
        ...this.snapshot.p2,
        x: 650,
        meter: POWER_METER_STOCK / 2,
        state: "idle",
        stateFrame: 24,
        hitstop: 0,
        health: 120,
      },
    };
  }

  private primeHitstunDemo(): void {
    let next = this.snapshot;
    for (let index = 0; index < 90; index += 1) {
      const frame = next.frame + 1;
      next = this.simulation.step({
        p1: createInput(frame, {
          horizontal: 1,
          vertical: 0,
          buttons: buttonsFromKeys({}),
        }),
        p2: createInput(frame),
      });
    }
    for (let index = 0; index < 8; index += 1) {
      const frame = next.frame + 1;
      next = this.simulation.step({
        p1: createInput(frame, {
          horizontal: 0,
          vertical: 0,
          buttons: buttonsFromKeys({ light: true }),
        }),
        p2: createInput(frame),
      });
    }
    for (let index = 0; index < 16; index += 1) {
      const frame = next.frame + 1;
      next = this.simulation.step({
        p1: createInput(frame),
        p2: createInput(frame),
      });
    }
    this.snapshot = next;
  }

  private primeBlockstunDemo(): void {
    let next = this.snapshot;
    for (let index = 0; index < 115; index += 1) {
      const frame = next.frame + 1;
      next = this.simulation.step({
        p1: createInput(frame, {
          horizontal: 1,
          vertical: 0,
          buttons: buttonsFromKeys({}),
        }),
        p2: createInput(frame),
      });
    }
    for (let index = 0; index < 8; index += 1) {
      const frame = next.frame + 1;
      const blockingActiveFrames = index >= 4 && index <= 6;
      next = this.simulation.step({
        p1: createInput(frame, {
          horizontal: 0,
          vertical: 0,
          buttons: buttonsFromKeys({ light: true }),
        }),
        p2: blockingActiveFrames
          ? createInput(frame, {
              horizontal: 1,
              vertical: 0,
              buttons: buttonsFromKeys({ guard: true }),
            })
          : createInput(frame),
      });
    }
    for (let index = 0; index < 8; index += 1) {
      const frame = next.frame + 1;
      next = this.simulation.step({
        p1: createInput(frame),
        p2: createInput(frame),
      });
    }
    this.snapshot = {
      ...next,
      combo: { attacker: null, defender: null, count: 0, damage: 0, lastHitFrame: null },
      p2: {
        ...next.p2,
        health: 1000,
        state: "blockstun",
        stateFrame: 16,
        hitstop: 0,
      },
    };
  }

  private primeCombatReadabilityDemo(demoMode: string): void {
    const cue = combatReadabilityDemoCue(demoMode);
    if (!cue) return;

    const frame = 240;
    const event: CombatEvent =
      cue.kind === "hit"
        ? {
            type: "hit",
            frame,
            attacker: "p1",
            defender: "p2",
            move: cue.move,
            damage: cue.damage,
          }
        : {
            type: "block",
            frame,
            attacker: "p1",
            defender: "p2",
            move: cue.move,
          };

    this.snapshot = {
      ...this.snapshot,
      frame,
      roundTimer: 96,
      status: "fighting",
      winner: null,
      events: [event],
      combo:
        cue.kind === "hit"
          ? { attacker: "p1", defender: "p2", count: 1, damage: cue.damage, lastHitFrame: frame }
          : { attacker: null, defender: null, count: 0, damage: 0, lastHitFrame: null },
      p1: {
        ...this.snapshot.p1,
        x: 552,
        meter: cue.move === "super" ? POWER_METER_STOCK : this.snapshot.p1.meter,
        state: "idle",
        stateFrame: 24,
        hitstop: 0,
        guarding: false,
      },
      p2: {
        ...this.snapshot.p2,
        x: 704,
        health: cue.kind === "hit" ? Math.max(1, 1000 - cue.damage) : 1000,
        state: "idle",
        stateFrame: 24,
        hitstop: 0,
        guarding: false,
      },
    };
    this.effects = effectsFromSnapshot(this.snapshot);
    this.damageNumbers = damageNumbersFromSnapshot(this.snapshot);
    this.triggerImpactFeedback();
  }

  private renderShellText(): void {
    const selectedFighterDetails = this.selectedFighterDetails();
    this.titleText.setText(shellTitle(this.shell, this.snapshot, this.matchSet));
    this.helpText.setText(
      this.shell.phase === "paused"
        ? this.browserSettingsHelpText(selectedFighterDetails)
        : shellHelp(this.shell, this.selectionLabel(), selectedFighterDetails),
    );
    this.titleText.setVisible(true);
    this.versusText.setVisible(this.shell.phase === "select");
    this.helpText.setVisible(true);
    this.helpText.setLineSpacing(8);
    if (this.shell.phase === "fighting") {
      this.titleText.setPosition(512, 182);
      this.titleText.setFontSize(34);
      this.helpText.setPosition(512, 532);
      this.helpText.setFontSize(13);
      this.helpText.setLineSpacing(6);
      this.helpText.setAlpha(0.78);
      this.helpText.setVisible(!this.canRenderRuntimeUi());
    } else if (this.shell.phase === "select") {
      this.titleText.setPosition(512, 126);
      this.titleText.setFontSize(28);
      this.helpText.setPosition(512, 184);
      this.helpText.setFontSize(13);
      this.helpText.setLineSpacing(4);
      this.helpText.setAlpha(1);
    } else if (this.shell.phase === "mode-select") {
      this.titleText.setPosition(512, 138);
      this.titleText.setFontSize(30);
      this.helpText.setPosition(512, 218);
      this.helpText.setFontSize(14);
      this.helpText.setLineSpacing(5);
      this.helpText.setAlpha(1);
    } else if (this.shell.phase === "ready") {
      this.titleText.setPosition(512, 178);
      this.titleText.setFontSize(44);
      this.helpText.setPosition(512, this.canRenderRuntimeUi() ? 356 : 264);
      this.helpText.setFontSize(16);
      this.helpText.setAlpha(1);
    } else if (this.shell.phase === "paused") {
      this.titleText.setText("PAUSED");
      this.titleText.setPosition(512, 194);
      this.titleText.setFontSize(31);
      this.helpText.setPosition(512, 314);
      this.helpText.setFontSize(13);
      this.helpText.setLineSpacing(5);
      this.helpText.setAlpha(1);
    } else {
      this.titleText.setPosition(512, 182);
      this.titleText.setFontSize(34);
      this.helpText.setPosition(512, 258);
      this.helpText.setFontSize(16);
      this.helpText.setLineSpacing(6);
      this.helpText.setAlpha(1);
    }

    if (
      (this.shell.phase === "round-over" || this.shell.phase === "match-over") &&
      this.canRenderRuntimeUi() &&
      this.runtimeOverlaySlot()
    ) {
      this.titleText.setVisible(false);
      this.helpText.setVisible(false);
    }
  }

  private renderChampionshipPresentation(): void {
    const presentation = this.championshipPresentationState();
    if (!presentation.visible) {
      this.championshipTitleText.setVisible(false);
      this.championshipBodyText.setVisible(false);
      return;
    }

    const body = championshipPresentationBodyLines(presentation).join("\n");
    this.championshipTitleText
      .setText(presentation.headline)
      .setPosition(512, 106)
      .setVisible(true);
    this.championshipBodyText
      .setText(body)
      .setPosition(512, 126)
      .setVisible(true);
  }

  private renderTrainingPresentation(): void {
    const presentation = this.trainingPresentationState();
    if (!presentation.visible) {
      this.trainingTitleText.setVisible(false);
      this.trainingBodyText.setVisible(false);
      return;
    }

    this.trainingTitleText
      .setText(presentation.headline)
      .setPosition(512, 106)
      .setVisible(true);
    this.trainingBodyText
      .setText([presentation.body, presentation.dummyLine, presentation.feedbackLine, presentation.callToAction].join("\n"))
      .setPosition(512, 126)
      .setVisible(true);
  }

  private renderReadinessText(): void {
    if (this.shell.phase !== "select") {
      this.readinessText.setVisible(false);
      return;
    }

    this.readinessText.setText(selectFooterLine(this.assetReadiness)).setPosition(512, 506).setVisible(true);
  }

  private renderConceptArt(): void {
    const shouldShow = this.canRenderConceptArt();
    for (const player of ["p1", "p2"] as const) {
      const preview = this.conceptPreviews[player];
      if (!preview) continue;

      const placement = conceptArtPlacement(this.shell, player);
      preview
        .setPosition(placement.x, placement.y)
        .setDisplaySize(placement.width, placement.height)
        .setDepth(100)
        .setVisible(shouldShow);
    }
  }

  private renderSelectSprites(): void {
    const shouldShow =
      (this.shell.phase === "ready" || this.shell.phase === "mode-select" || this.shell.phase === "select") &&
      !this.canRenderConceptArt() &&
      this.canRenderSelectSprites();
    for (const player of ["p1", "p2"] as const) {
      const sprite = this.selectSprites[player];
      const assetKey = this.selectIdleAssetKey(player);
      if (!shouldShow || !assetKey) {
        sprite.setVisible(false);
        continue;
      }

      const pose = selectSpritePose("idle", this.shellFrame, 8);
      const placement = selectSpritePlacement(this.shell, player);
      sprite
        .setTexture(assetKey)
        .setFrame(pose.frame)
        .setPosition(placement.x, placement.y + pose.offsetY)
        .setScale(placement.scale * pose.scaleX, placement.scale * pose.scaleY)
        .setFlipX(player === "p2")
        .setVisible(true);
    }
  }

  private canRenderSelectSprites(): boolean {
    return (["p1", "p2"] as const).every((player) => {
      const assetKey = this.selectIdleAssetKey(player);
      return assetKey ? this.textures.exists(assetKey) : false;
    });
  }

  private canRenderConceptArt(): boolean {
    return Boolean(
      CONCEPT_SHEET &&
        (this.shell.phase === "ready" || this.shell.phase === "mode-select") &&
        !this.canRenderSelectSprites() &&
        this.textures.exists(CONCEPT_SHEET.key),
    );
  }

  private selectIdleAssetKey(player: "p1" | "p2"): string | null {
    const fighter = selectedFighter(this.selectedFighterIndex[player]);
    const runtimeAsset = resolveFighterRuntimeAsset(renderAssetForAnimationId(manifestForCharacter(fighter.id), "idle"));
    return runtimeAsset.kind === "sprite" ? runtimeAsset.assetKey : null;
  }

  private renderHudPortraitSprites(showFightLayer: boolean): void {
    for (const player of ["p1", "p2"] as const) {
      const sprite = this.hudPortraitSprites[player];
      const assetKey = this.selectIdleAssetKey(player);
      const staticSlot = this.staticHudPortraitSlot(player);
      if (!showFightLayer || staticSlot || !assetKey || !this.textures.exists(assetKey)) {
        sprite.setVisible(false);
        continue;
      }

      const placement = hudPortraitPlacement(player);
      sprite
        .setTexture(assetKey)
        .setFrame(0)
        .setPosition(placement.x, placement.y)
        .setScale(placement.scale)
        .setFlipX(player === "p2")
        .setVisible(true);
    }
  }

  private hudPortraitState(player: "p1" | "p2") {
    const fighter = selectedFighter(this.selectedFighterIndex[player]);
    const staticSlot = this.staticHudPortraitSlot(player);
    const dynamicAssetKey = staticSlot ? null : this.selectIdleAssetKey(player);

    return {
      fighterId: fighter.id,
      displayName: fighter.displayName,
      staticSlot,
      dynamicAssetKey,
      dynamicVisible: this.hudPortraitSprites[player].visible,
      usesFallback: !staticSlot && (!dynamicAssetKey || !this.textures.exists(dynamicAssetKey)),
    };
  }

  private staticHudPortraitSlot(player: "p1" | "p2"): RuntimeUiImageSlot | null {
    const fighter = selectedFighter(this.selectedFighterIndex[player]);
    if (player === "p1" && fighter.id === "gray-rabbit") return "rabbit-portrait";
    if (player === "p2" && fighter.id === "ginger-tabby-cat") return "cat-portrait";
    return null;
  }

  private selectedFighterDetails(): { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile } {
    return {
      p1: this.selectedFighterProfile("p1"),
      p2: this.selectedFighterProfile("p2"),
    };
  }

  private selectedFighterProfile(player: "p1" | "p2"): SelectedFighterTextProfile {
    const rosterIndex = this.selectedFighterIndex[player];
    const fighter = selectedFighter(rosterIndex);
    const content = GAME_CONFIG.contentSpine.fighters.find((candidate) => candidate.id === fighter.id);

    return {
      fighterId: fighter.id,
      displayName: fighter.displayName,
      leagueName: content?.name ?? fighter.displayName,
      rosterIndex,
      storyHook: content?.storyHook ?? null,
      trainingTip: content?.trainingTip ?? null,
      signatureMove: content?.signatureMove ?? null,
      superMove: content?.superMove ?? null,
    };
  }

  private runtimeRosterState() {
    return FIGHTER_ROSTER.map((fighter, index) => {
      const content = GAME_CONFIG.contentSpine.fighters.find((candidate) => candidate.id === fighter.id);
      return {
        fighterId: fighter.id,
        displayName: fighter.displayName,
        leagueName: content?.name ?? fighter.displayName,
        rosterIndex: index,
        storyHook: content?.storyHook ?? null,
        trainingTip: content?.trainingTip ?? null,
        signatureMove: content?.signatureMove ?? null,
        superMove: content?.superMove ?? null,
        runtimeStatus: content?.runtime.status ?? "active",
      };
    });
  }

  private shellPresentationState(selectedFighterDetails: { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile }) {
    const title = shellTitle(this.shell, this.snapshot, this.matchSet);
    const help =
      this.shell.phase === "paused"
        ? this.browserSettingsHelpText(selectedFighterDetails)
        : shellHelp(this.shell, this.selectionLabel(), selectedFighterDetails);
    const mode = selectedPlayMode(this.shell);
    const modeContent = GAME_CONFIG.contentSpine.modes.find((candidate) => candidate.id === mode);
    const runtimeFighters = GAME_CONFIG.contentSpine.fighters.filter((fighter) => fighter.runtime.status === "active");
    const plannedFighters = GAME_CONFIG.contentSpine.fighters.filter((fighter) => fighter.runtime.status === "planned");

    return {
      phase: this.shell.phase,
      title,
      keyboardFirst: true,
      orientation: GAME_CONFIG.contentSpine.platformPlan.browserV1.orientation,
      touchPlan: "mobile-v2",
      mode: {
        id: mode,
        label: shellModeLabel(this.shell),
        status: modeContent?.status ?? "implemented",
        purpose: modeContent?.purpose ?? shellModeDescription(this.shell),
        description: shellModeDescription(this.shell),
        panelLines: modeSelectText(this.shell, this.cpuDifficulty).split("\n"),
      },
      roster: {
        playableCount: runtimeFighters.length,
        plannedLockedCount: plannedFighters.length,
        playableFighterIds: runtimeFighters.map((fighter) => fighter.id),
        plannedFightersPlayable: false,
        truthLine: selectFooterLine(this.assetReadiness),
      },
      selectedFighters: {
        p1: fighterShellCard(selectedFighterDetails.p1, "P1"),
        p2: fighterShellCard(selectedFighterDetails.p2, playModeUsesCpu(this.shell) ? "CPU" : "P2"),
      },
      settings: this.browserSettingsTextState(selectedFighterDetails),
      actions: shellActionLines(this.shell),
      visibleCopy: {
        title,
        help,
        settingsPanel: this.shell.phase === "paused" ? this.browserSettingsHelpText(selectedFighterDetails) : null,
        modePanel: this.shell.phase === "mode-select" ? modeSelectText(this.shell, this.cpuDifficulty) : null,
        selectFooter: this.shell.phase === "select" ? selectFooterLine(this.assetReadiness) : null,
      },
    };
  }

  private selectionLabel(): string {
    const p2Role = playModeUsesCpu(this.shell) ? "CPU" : "P2";
    const details = this.selectedFighterDetails();
    return `P1 ${details.p1.leagueName}  |  ${p2Role} ${details.p2.leagueName}`;
  }

  private renderComboText(snapshot: MatchSnapshot): void {
    if (snapshot.combo.count < 2 || !snapshot.combo.attacker) {
      this.comboText.setVisible(false);
      return;
    }

    const isP1Combo = snapshot.combo.attacker === "p1";
    this.comboText
      .setText(`${snapshot.combo.count} HIT / ${snapshot.combo.damage}`)
      .setPosition(isP1Combo ? 132 : 892, 124)
      .setOrigin(isP1Combo ? 0 : 1, 0)
      .setVisible(true);
  }

  private installDebugHooks(): void {
    window.render_game_to_text = () => this.renderTextState();
    window.advanceTime = (ms: number) => this.advanceDebug(ms);
    this.input.keyboard?.on("keydown", () => this.audio.unlock());
  }

  private controlFallbackState(): ControlFallbackState {
    const gamepadSupported = typeof navigator.getGamepads === "function";
    const gamepads = gamepadSupported ? navigator.getGamepads() : [];
    const connectedGamepads = Array.from(gamepads).filter((gamepad) => gamepad?.connected).length;
    return buildControlFallbackState({
      connectedGamepads,
      gamepadSupported,
      touchSupported: this.shouldShowTouchControls(),
    });
  }

  private readGamepadInput(): GamepadInputState {
    if (typeof navigator.getGamepads !== "function") {
      return EMPTY_GAMEPAD_INPUT;
    }
    return gamepadInputFromGamepads(Array.from(navigator.getGamepads()));
  }

  private toggleFullscreen(): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }
    this.scale.startFullscreen();
  }

  private triggerImpactFeedback(): void {
    const cue = impactFeedbackCue(this.snapshot.events);
    if (!cue) return;

    this.cameras.main.shake(cue.duration, cue.intensity);
    this.impactFlash = {
      color: rgbToNumber(cue.flash.red, cue.flash.green, cue.flash.blue),
      alpha: cue.flash.alpha,
      remainingFrames: Math.max(1, Math.ceil(cue.duration / TICK_MS)),
      totalFrames: Math.max(1, Math.ceil(cue.duration / TICK_MS)),
    };
  }
}

function tickImpactFlash(flash: ImpactFlash | null): ImpactFlash | null {
  if (!flash) return null;
  if (flash.remainingFrames <= 1) return null;
  return { ...flash, remainingFrames: flash.remainingFrames - 1 };
}

function drawImpactFlash(g: Phaser.GameObjects.Graphics, flash: ImpactFlash | null): void {
  if (!flash) return;
  const progress = flash.remainingFrames / flash.totalFrames;
  g.fillStyle(flash.color, flash.alpha * progress).fillRect(0, 0, 1024, 576);
}

function rgbToNumber(red: number, green: number, blue: number): number {
  return ((red & 255) << 16) | ((green & 255) << 8) | (blue & 255);
}

function drawEffects(g: Phaser.GameObjects.Graphics, effects: readonly CombatEffect[]): void {
  for (const effect of effects) {
    const style = combatEffectStyle(effect);
    const alpha = Math.max(0, 1 - effect.age / effect.duration);
    const progress = Phaser.Math.Clamp(effect.age / effect.duration, 0, 1);
    const pulse = 1 + Math.sin(progress * Math.PI) * 0.18;
    const radius = style.radius * pulse + effect.age * 0.28;

    for (let ring = 0; ring < style.shockwaves; ring += 1) {
      const ringProgress = Phaser.Math.Clamp(progress + ring * 0.16, 0, 1);
      const ringAlpha = alpha * (0.34 - ring * 0.07);
      if (ringAlpha > 0) {
        g.lineStyle(Math.max(2, style.lineWidth - ring * 2), ring === 0 ? style.secondary : style.highlight, ringAlpha);
        g.strokeCircle(effect.x, effect.y, radius + ringProgress * (18 + ring * 8));
      }
    }

    if (effect.kind === "hit") {
      g.fillStyle(style.highlight, alpha * 0.34).fillCircle(effect.x, effect.y, Math.max(8, radius * 0.46));
      g.fillStyle(style.primary, alpha * 0.28).fillCircle(effect.x, effect.y, Math.max(5, radius * 0.28));
      for (let index = 0; index < style.rays; index += 1) {
        const angle = (Math.PI * 2 * index) / style.rays + progress * 0.35;
        const inner = radius * 0.42;
        const outer = radius + (index % 2 === 0 ? 18 : 10);
        g.lineStyle(index % 2 === 0 ? style.lineWidth : Math.max(2, style.lineWidth - 2), index % 2 === 0 ? style.primary : style.secondary, alpha);
        g.lineBetween(
          effect.x + Math.cos(angle) * inner,
          effect.y + Math.sin(angle) * inner,
          effect.x + Math.cos(angle) * outer,
          effect.y + Math.sin(angle) * outer,
        );
      }
      if (effect.tier === "special" || effect.tier === "super") {
        g.lineStyle(effect.tier === "super" ? 4 : 3, style.highlight, alpha * 0.72);
        g.strokeCircle(effect.x, effect.y, radius * (effect.tier === "super" ? 1.34 : 1.18));
      }
      continue;
    }

    const shieldWidth = radius * 1.15;
    const shieldHeight = radius * 1.55;
    g.fillStyle(style.primary, alpha * 0.16).fillEllipse(effect.x, effect.y, shieldWidth, shieldHeight);
    g.lineStyle(style.lineWidth, style.primary, alpha).strokeEllipse(effect.x, effect.y, shieldWidth, shieldHeight);
    g.lineStyle(Math.max(2, style.lineWidth - 2), style.highlight, alpha * 0.72);
    g.lineBetween(effect.x - radius * 0.48, effect.y - radius * 0.52, effect.x + radius * 0.48, effect.y + radius * 0.52);
    g.lineBetween(effect.x - radius * 0.48, effect.y + radius * 0.52, effect.x + radius * 0.48, effect.y - radius * 0.52);
    g.lineStyle(2, style.secondary, alpha * 0.86).strokeCircle(effect.x, effect.y, radius * 0.62);
  }
}

function shellTitle(shell: ShellState, snapshot: MatchSnapshot, matchSet: MatchSetState): string {
  if (shell.phase === "ready") return GAME_TITLE;
  if (shell.phase === "mode-select") return "SELECT PLAY MODE";
  if (shell.phase === "select") return "SELECT YOUR FIGHTERS";
  if (shell.phase === "paused") return "PAUSED";
  if (shell.phase === "round-over") return roundResultLabel(snapshot);
  if (shell.phase === "match-over") return matchResultLabel(matchSet);
  return "";
}

function shellHelp(
  shell: ShellState,
  selectionLabel: string,
  selectedFighterDetails: { p1: SelectedFighterTextProfile; p2: SelectedFighterTextProfile },
): string {
  if (shell.phase === "ready") {
    return `${GAME_SUBTITLE}\nKEYBOARD-FIRST LANDSCAPE BUILD\nENTER / SPACE START`;
  }
  if (shell.phase === "mode-select") {
    return "A/D or arrows choose mode  |  Enter/Space select\nKeyboard v1: tuned for browser landscape";
  }
  if (shell.phase === "select") {
    const p2Role = playModeUsesCpu(shell) ? "CPU" : "P2";
    return [
      selectionLabel,
      fighterSelectMoveLine(selectedFighterDetails.p1, "P1"),
      fighterSelectMoveLine(selectedFighterDetails.p2, p2Role),
      `Story: ${fighterStoryTag(selectedFighterDetails.p1)} vs ${fighterStoryTag(selectedFighterDetails.p2)}`,
      "A/D/B P1  |  arrows CPU/P2  |  Enter/Space fight",
    ].join("\n");
  }
  if (shell.phase === "round-over") {
    return "ENTER / SPACE NEXT ROUND\nR RESET TO READY";
  }
  if (shell.phase === "match-over") {
    return "ENTER / SPACE REMATCH\nR RESET TO READY";
  }
  if (shell.phase === "paused") {
    return "START / P / ESC RESUME\nR RESET TO READY\nF FULLSCREEN\nC CPU  |  V LEVEL";
  }
  if (selectedPlayMode(shell) === "training") {
    return "Training lab  |  Space/J light  |  I kick  |  K heavy  |  L special  |  P pause  |  R reset";
  }
  if (selectedPlayMode(shell) === "championship") {
    return "Snackbelt rival fight  |  Space/J light  |  I kick  |  K heavy  |  L special  |  S,D,L super  |  P pause  |  R reset";
  }
  if (selectedPlayMode(shell) === "local-versus") {
    return "Local Versus  |  P1 WASD + JIKL  |  P2 arrows + Numpad 1/4/2/3  |  P pause  |  R reset";
  }
  return "Double-tap D/B run  |  W+dir hop  |  Space/J light  |  I kick  |  K heavy  |  L special  |  S,D,L super  |  C CPU  |  V level  |  P pause  |  F full";
}

function championshipPresentationBodyLines(presentation: {
  body: string;
  callToAction: string;
  reward: ChampionshipRewardState;
  interstitial: ChampionshipRewardInterstitial;
}): string[] {
  if (presentation.interstitial.kind === "cleared" || presentation.interstitial.kind === "failed") {
    return [
      presentation.body,
      presentation.reward.claimLine,
      presentation.interstitial.payoffLine,
      presentation.callToAction,
    ].filter((line) => line.length > 0);
  }

  return [
    presentation.body,
    presentation.interstitial.progressLine,
    presentation.reward.claimLine,
    presentation.callToAction,
  ].filter((line) => line.length > 0);
}

function championshipRewardState(
  kind: ChampionshipInterstitialKind,
  progress: { completedCount: number; totalOpponents: number },
  player: FighterStoryTextProfile,
  rival: FighterStoryTextProfile | null,
): ChampionshipRewardState {
  const title = "Snackbelt Treat Dispenser";
  if (kind === "cleared") {
    return {
      title,
      status: "claimed",
      claimLine: `Reward claimed: treat dispenser + good couch naming rights for ${player.displayName}.`,
    };
  }
  if (kind === "failed") {
    return {
      title,
      status: "lost",
      claimLine: `Reward lost: ${rival?.displayName ?? "the bracket"} holds the belt for a rematch.`,
    };
  }
  if (kind === "advance") {
    return {
      title,
      status: "checkpoint",
      claimLine: `Reward checkpoint: ${progress.completedCount}/${progress.totalOpponents} stamps; couch rights still pending.`,
    };
  }

  return {
    title,
    status: "up-for-grabs",
    claimLine: `Prize track: ${progress.completedCount}/${progress.totalOpponents} stamps toward treat dispenser + couch rights.`,
  };
}

function championshipInterstitialState(
  kind: ChampionshipInterstitialKind,
  progress: { completedCount: number; totalOpponents: number },
  player: FighterStoryTextProfile,
  rival: FighterStoryTextProfile | null,
  lastCompletedRival: FighterStoryTextProfile | null,
  nextAction: string,
): ChampionshipRewardInterstitial {
  const rosterTruth = "3 playable runtime fighters; 5 planned locked for model-sheet QA";
  const rivalLabel = rival ? `${kind === "advance" ? "Next" : "Current"} ${rival.displayName}` : "No active rival";
  const progressLine = `Progress: ${progress.completedCount}/${progress.totalOpponents} rivals folded | ${rivalLabel}`;

  if (kind === "cleared") {
    return {
      kind,
      progressLine: `Progress: ${progress.completedCount}/${progress.totalOpponents} rivals folded | runtime ladder cleared`,
      payoffLine: `${player.displayName}'s title is official until somebody licks the paperwork again.`,
      nextAction,
      rosterTruth,
      completedCount: progress.completedCount,
      totalOpponents: progress.totalOpponents,
    };
  }
  if (kind === "failed") {
    return {
      kind,
      progressLine,
      payoffLine: `${rival?.displayName ?? "The bracket"} confiscates the snack paperwork until the rematch.`,
      nextAction,
      rosterTruth,
      completedCount: progress.completedCount,
      totalOpponents: progress.totalOpponents,
    };
  }
  if (kind === "advance") {
    return {
      kind,
      progressLine,
      payoffLine: `${lastCompletedRival?.displayName ?? "One rival"} folded; ${rival?.displayName ?? "the next rival"} is now accepting snacks as legal tender.`,
      nextAction,
      rosterTruth,
      completedCount: progress.completedCount,
      totalOpponents: progress.totalOpponents,
    };
  }

  return {
    kind,
    progressLine,
    payoffLine: "Win the set, claim a stamp, and keep the paperwork unchewed.",
    nextAction,
    rosterTruth,
    completedCount: progress.completedCount,
    totalOpponents: progress.totalOpponents,
  };
}

function modeSelectText(shell: ShellState, cpuDifficulty: CpuDifficulty): string {
  return [shellModeLabel(shell), ...shellModeDetailLines(shell, cpuDifficulty)].join("\n");
}

function shellModeDetailLines(shell: ShellState, cpuDifficulty: CpuDifficulty): readonly string[] {
  const mode = selectedPlayMode(shell);
  if (mode === "training") return ["ENDLESS LAB", "TIMING + COMBO FEEDBACK"];
  if (mode === "championship") return ["SNACKBELT LADDER", "2 CPU RIVALS"];
  if (mode === "local-versus") return ["SAME KEYBOARD PVP", "P1 VS P2 MANUAL"];
  return ["BEST OF THREE", `CPU ${cpuDifficulty.toUpperCase()}`];
}

function shellActionLines(shell: ShellState): readonly string[] {
  if (shell.phase === "ready") return ["Enter/Space opens mode select"];
  if (shell.phase === "mode-select") return ["A/D or arrows choose mode", "Enter/Space opens fighter select"];
  if (shell.phase === "select") return ["A/D/B choose P1", "Arrows choose CPU/P2", "Enter/Space starts fight"];
  if (shell.phase === "paused") return ["Start/P/Esc resume", "R reset", "F fullscreen", "C/V CPU settings"];
  if (shell.phase === "round-over") return ["Enter/Space next round", "R reset"];
  if (shell.phase === "match-over") return ["Enter/Space rematch", "R reset"];
  return ["Keyboard attacks and movement active"];
}

function fighterShellCard(profile: SelectedFighterTextProfile, role: string) {
  return {
    role,
    fighterId: profile.fighterId,
    displayName: profile.displayName,
    leagueName: profile.leagueName,
    storyHook: profile.storyHook,
    trainingTip: profile.trainingTip,
    signatureMove: profile.signatureMove,
    superMove: profile.superMove,
    storyTag: fighterStoryTag(profile),
  };
}

function fighterSelectMoveLine(profile: SelectedFighterTextProfile, role: string): string {
  return `${role} ${profile.leagueName}: ${profile.signatureMove ?? "signature ready"} / ${
    profile.superMove ?? "super ready"
  }`;
}

function fighterStoryTag(profile: Pick<SelectedFighterTextProfile, "fighterId" | "storyHook">): string {
  if (profile.fighterId === "gray-rabbit") return "cardboard castle";
  if (profile.fighterId === "ginger-tabby-cat") return "prize couch";
  if (profile.fighterId === "pugilist-pug") return "edible trophy";
  return profile.storyHook?.split(".")[0] ?? "league glory";
}

function nextCpuDifficulty(current: CpuDifficulty): CpuDifficulty {
  return nextCpuDifficultyFromConfig(GAME_CONFIG, current);
}

function selectedFighter(index: number) {
  return selectedFighterFromConfig(GAME_CONFIG, index);
}

function fighterRosterIndex(fighterId: string): number {
  const index = FIGHTER_ROSTER.findIndex((fighter) => fighter.id === fighterId);
  if (index < 0) {
    throw new Error(`Missing runtime fighter ${fighterId}.`);
  }
  return index;
}

function fighterSummary(fighterId: string) {
  const fighter = FIGHTER_ROSTER[fighterRosterIndex(fighterId)];
  return {
    fighterId: fighter.id,
    displayName: fighter.displayName,
  };
}

function fighterStorySummary(fighterId: string): FighterStoryTextProfile {
  const fighter = FIGHTER_ROSTER[fighterRosterIndex(fighterId)];
  const content = GAME_CONFIG.contentSpine.fighters.find((candidate) => candidate.id === fighterId);
  return {
    fighterId: fighter.id,
    displayName: fighter.displayName,
    leagueName: content?.name ?? fighter.displayName,
    storyHook: content?.storyHook ?? null,
    signatureMove: content?.signatureMove ?? null,
    superMove: content?.superMove ?? null,
  };
}

function trainingActionLabel(fighter: MatchSnapshot["p1"]): string {
  if (fighter.guarding) return "Guarding";
  switch (fighter.state) {
    case "lightAttack":
      return "Light punch";
    case "lightKick":
      return "Light kick";
    case "heavyAttack":
      return "Heavy punch";
    case "specialAttack":
      return "Special";
    case "superAttack":
      return "Super";
    case "walkForward":
      return "Walking forward";
    case "walkBack":
      return "Walking back";
    case "runForward":
      return "Running";
    case "backdash":
      return "Backdash";
    case "rollForward":
    case "rollBack":
      return "Roll";
    case "jump":
    case "hop":
      return "Air movement";
    case "crouch":
      return "Crouch";
    case "hitstun":
      return "Hit reaction";
    case "blockstun":
      return "Block reaction";
    case "knockdown":
      return "Knockdown";
    case "idle":
    default:
      return "Neutral";
  }
}

function trainingDummyStatusLabel(fighter: MatchSnapshot["p2"]): string {
  if (fighter.guarding) return "guarding";
  if (fighter.state === "hitstun") return "hit reaction";
  if (fighter.state === "blockstun") return "blocking reaction";
  if (fighter.state === "knockdown") return "knockdown locked";
  if (fighter.health <= 1) return "health lock active";
  return "standing by";
}

function isCombatReadabilityDemoMode(mode: string | null): boolean {
  return mode?.startsWith("combat-readability-") ?? false;
}

function combatReadabilityDemoCue(
  mode: string,
): { kind: "hit"; move: CommandId; damage: number } | { kind: "block"; move: CommandId } | null {
  if (mode === "combat-readability-light") return { kind: "hit", move: "light", damage: 45 };
  if (mode === "combat-readability-block") return { kind: "block", move: "heavy" };
  if (mode === "combat-readability-heavy") return { kind: "hit", move: "heavy", damage: 90 };
  if (mode === "combat-readability-special") return { kind: "hit", move: "special", damage: 120 };
  if (mode === "combat-readability-super") return { kind: "hit", move: "super", damage: 180 };
  return null;
}

function inactiveChampionshipLadder(): ChampionshipLadderState {
  return {
    status: "inactive",
    result: null,
    playerFighterId: null,
    opponentIds: [],
    opponentIndex: 0,
    completedOpponentIds: [],
  };
}

function championshipLadderLabel(ladder: ChampionshipLadderState, currentOpponentId: string | null): string {
  if (ladder.status === "complete") {
    return ladder.result === "cleared" ? "Championship cleared" : "Championship run ended";
  }
  if (ladder.status !== "in-progress" || !currentOpponentId) {
    return "Championship ladder";
  }

  return `Championship ${ladder.opponentIndex + 1}/${ladder.opponentIds.length}: ${
    fighterSummary(currentOpponentId).displayName
  }`;
}

function runtimeUiAssetConfig(id: RuntimeUiAssetId): RuntimeUiAssetConfig {
  const asset = RUNTIME_UI_ASSETS.find((candidate) => candidate.id === id);
  if (!asset) {
    throw new Error(`Missing runtime UI asset config for ${id}.`);
  }
  return asset;
}

function selectSpritePlacement(shell: ShellState, player: "p1" | "p2"): { x: number; y: number; scale: number } {
  if (shell.phase === "ready" || shell.phase === "mode-select") {
    return player === "p1"
      ? { x: 188, y: 512, scale: 1.36 }
      : { x: 836, y: 512, scale: 1.36 };
  }

  return player === "p1"
    ? { x: 318, y: 470, scale: 1.06 }
    : { x: 706, y: 470, scale: 1.06 };
}

function hudPortraitPlacement(player: "p1" | "p2"): { x: number; y: number; scale: number } {
  return player === "p1" ? { x: 72, y: 132, scale: 0.44 } : { x: 952, y: 132, scale: 0.44 };
}

function conceptArtPlacement(
  shell: ShellState,
  player: "p1" | "p2",
): { x: number; y: number; width: number; height: number } {
  if (shell.phase === "ready") {
    return player === "p1"
      ? { x: 164, y: 330, width: 246, height: 404 }
      : { x: 860, y: 330, width: 246, height: 404 };
  }

  if (shell.phase === "mode-select") {
    return player === "p1"
      ? { x: 164, y: 352, width: 230, height: 378 }
      : { x: 860, y: 352, width: 230, height: 378 };
  }

  return player === "p1"
    ? { x: 318, y: 366, width: 178, height: 292 }
    : { x: 706, y: 366, width: 178, height: 292 };
}

function selectFooterLine(summary: ReturnType<typeof buildAssetReadinessSummary>): string {
  const fallbackCount = summary.runtimeFallbacks.fighterAnimations + summary.runtimeFallbacks.stageLayers;
  const playableCount = GAME_CONFIG.contentSpine.fighters.filter((fighter) => fighter.runtime.status === "active").length;
  const plannedLockedCount = GAME_CONFIG.contentSpine.fighters.filter((fighter) => fighter.runtime.status === "planned").length;
  if (fallbackCount > 0) return `${playableCount} PLAYABLE NOW  |  PROTOTYPE ASSETS ACTIVE`;
  return `${playableCount} PLAYABLE NOW  |  ${plannedLockedCount} PLANNED LOCKED FOR MODEL-SHEET QA`;
}

function powerStockLabel(meter: number): string {
  return String(Math.floor(meter / POWER_METER_STOCK));
}

function manifestForCharacter(characterId: string) {
  const manifest = FIGHTER_ASSET_MANIFESTS.find(
    (candidate) => candidate.engineCharacterId === characterId || candidate.displayName === characterId,
  );
  if (!manifest) {
    throw new Error(`Missing fighter asset manifest for ${characterId}`);
  }
  return manifest;
}

function versionedAsset(path: string): string {
  return versionedAssetFromConfig(GAME_CONFIG, path);
}

function roundMetric(value: number): number {
  return Math.round(value * 100) / 100;
}

function frameVisualBoundsFromPixels(
  pixels: Uint8ClampedArray,
  frame: { sheetWidth: number; frameX: number; frameWidth: number; frameHeight: number },
): SpriteFrameVisualBounds {
  let minX = frame.frameWidth;
  let maxX = -1;
  let minY = frame.frameHeight;
  let maxY = -1;

  for (let y = 0; y < frame.frameHeight; y += 1) {
    for (let localX = 0; localX < frame.frameWidth; localX += 1) {
      const alpha = pixels[(y * frame.sheetWidth + frame.frameX + localX) * 4 + 3];
      if (alpha > 20) {
        minX = Math.min(minX, localX);
        maxX = Math.max(maxX, localX);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    width: maxX >= 0 ? maxX - minX + 1 : 0,
    height: maxY >= 0 ? maxY - minY + 1 : 0,
  };
}

function drawNotchedPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill: number;
    accent: number;
    fillAlpha: number;
    strokeAlpha: number;
    strokeWidth?: number;
    cut?: number;
  },
): void {
  const cut = Math.min(options.cut ?? 12, width / 4, height / 3);
  traceNotchedRect(g, x, y, width, height, cut);
  g.fillStyle(options.fill, options.fillAlpha).fillPath();
  traceNotchedRect(g, x, y, width, height, cut);
  g.lineStyle(options.strokeWidth ?? 2, options.accent, options.strokeAlpha).strokePath();
  if (width > 42 && height > 22) {
    g.lineStyle(1, 0xf8f5e9, Math.min(0.26, options.strokeAlpha * 0.34));
    traceNotchedRect(g, x + 7, y + 7, width - 14, height - 14, Math.max(3, cut - 7));
    g.strokePath();
  }
}

function traceNotchedRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  cut: number,
): void {
  g.beginPath();
  g.moveTo(x + cut, y);
  g.lineTo(x + width - cut, y);
  g.lineTo(x + width, y + cut);
  g.lineTo(x + width, y + height - cut);
  g.lineTo(x + width - cut, y + height);
  g.lineTo(x + cut, y + height);
  g.lineTo(x, y + height - cut);
  g.lineTo(x, y + cut);
  g.closePath();
}

function drawTouchControlSurface(
  g: Phaser.GameObjects.Graphics,
  zone: { id: TouchControlId; x: number; y: number; width: number; height: number },
  chrome: TouchControlChrome,
): void {
  const centerX = zone.x + zone.width / 2;
  const centerY = zone.y + zone.height / 2;
  const pressedLift = chrome.strokeWidth > 2 ? 0 : 3;
  g.fillStyle(0x071312, 0.28).fillEllipse(centerX, centerY + zone.height * 0.34, zone.width * 0.86, 12);

  if (chrome.shape === "diamond") {
    g.fillStyle(chrome.glow, chrome.fillAlpha * 0.18).fillCircle(centerX, centerY, Math.max(zone.width, zone.height) * 0.46);
    g.fillStyle(chrome.fill, chrome.fillAlpha);
    g.beginPath();
    g.moveTo(centerX, zone.y + pressedLift);
    g.lineTo(zone.x + zone.width, centerY);
    g.lineTo(centerX, zone.y + zone.height - pressedLift);
    g.lineTo(zone.x, centerY);
    g.closePath();
    g.fillPath();
    g.lineStyle(chrome.strokeWidth, chrome.stroke, chrome.strokeAlpha);
    g.strokePath();
    drawTouchArrow(g, zone.id, centerX, centerY, Math.min(zone.width, zone.height) * 0.24, chrome.stroke);
    return;
  }

  drawNotchedPanel(g, zone.x, zone.y + pressedLift, zone.width, zone.height - pressedLift, {
    fill: chrome.fill,
    accent: chrome.stroke,
    fillAlpha: chrome.fillAlpha,
    strokeAlpha: chrome.strokeAlpha,
    strokeWidth: chrome.strokeWidth,
    cut: chrome.shape === "octagon" ? Math.max(8, Math.round(Math.min(zone.width, zone.height) * 0.18)) : 8,
  });
  g.fillStyle(0xf8f5e9, chrome.strokeWidth > 2 ? 0.2 : 0.1).fillRect(
    zone.x + 12,
    zone.y + 8 + pressedLift,
    Math.max(0, zone.width - 24),
    3,
  );
}

function drawTouchArrow(
  g: Phaser.GameObjects.Graphics,
  id: TouchControlId,
  centerX: number,
  centerY: number,
  size: number,
  color: number,
): void {
  g.fillStyle(color, 0.92);
  if (id === "left") {
    g.fillTriangle(centerX - size, centerY, centerX + size * 0.52, centerY - size, centerX + size * 0.52, centerY + size);
  } else if (id === "right") {
    g.fillTriangle(centerX + size, centerY, centerX - size * 0.52, centerY - size, centerX - size * 0.52, centerY + size);
  } else if (id === "up") {
    g.fillTriangle(centerX, centerY - size, centerX - size, centerY + size * 0.52, centerX + size, centerY + size * 0.52);
  } else if (id === "down") {
    g.fillTriangle(centerX, centerY + size, centerX - size, centerY - size * 0.52, centerX + size, centerY - size * 0.52);
  }
}

function drawShellBackdrop(
  g: Phaser.GameObjects.Graphics,
  shell: ShellState,
  stageArtVisible: boolean,
  runtimeUiVisible: boolean,
): void {
  if (shell.phase === "fighting") {
    if (!runtimeUiVisible) {
      drawNotchedPanel(g, 158, 512, 708, 36, {
        fill: 0x0b1817,
        accent: 0xf2cf7d,
        fillAlpha: 0.62,
        strokeAlpha: 0.5,
        cut: 10,
      });
    }
    return;
  }
  if (stageArtVisible) {
    g.fillStyle(0x071312, shell.phase === "select" ? 0.48 : 0.34).fillRect(0, 0, 1024, 576);
    drawZelligeRail(g, 0, shell.phase === "select" ? 0.84 : 0.72);
  }
  if (shell.phase === "paused") {
    g.fillStyle(0x071312, 0.52).fillRect(0, 0, 1024, 576);
    return;
  }
  if (shell.phase === "select") {
    drawNotchedPanel(g, 70, 74, 884, 468, {
      fill: 0x071312,
      accent: 0xf2cf7d,
      fillAlpha: 0.75,
      strokeAlpha: 0.9,
      cut: 20,
    });
    drawZelligeRail(g, 74, 0.64);
    drawZelligeRail(g, 518, 0.54);
    drawSelectionCard(g, 166, 228, 298, 264, 0x2ec4b6, "left");
    drawSelectionCard(g, 560, 228, 298, 264, 0xff9f1c, "right");
    drawVsMedallion(g, 512, 360);
    return;
  }
  if (shell.phase === "mode-select") {
    drawTitlePortraitFrame(g, 42, 120, 244, 410, 0x2ec4b6);
    drawTitlePortraitFrame(g, 738, 120, 244, 410, 0xff9f1c);
    drawNotchedPanel(g, 300, 252, 424, 138, {
      fill: 0x071312,
      accent: 0xf2cf7d,
      fillAlpha: 0.78,
      strokeAlpha: 0.9,
      cut: 18,
    });
    g.fillStyle(0xf2cf7d, 0.9).fillTriangle(332, 322, 364, 296, 364, 348);
    g.fillStyle(0xf2cf7d, 0.9).fillTriangle(692, 322, 660, 296, 660, 348);
    drawNotchedPanel(g, 386, 278, 252, 86, {
      fill: selectedPlayMode(shell) === "training" ? 0x0d2f2b : 0x2d1d0a,
      accent: selectedPlayMode(shell) === "training" ? 0x2ec4b6 : 0xff9f1c,
      fillAlpha: 0.76,
      strokeAlpha: 0.86,
      cut: 12,
    });
    return;
  }
  if ((shell.phase === "round-over" || shell.phase === "match-over") && runtimeUiVisible) {
    g.fillStyle(0x071312, 0.26).fillRect(0, 0, 1024, 576);
    return;
  }
  drawTitlePortraitFrame(g, 42, 120, 244, 410, 0x2ec4b6);
  drawTitlePortraitFrame(g, 738, 120, 244, 410, 0xff9f1c);
  drawNotchedPanel(g, 262, 92, 500, 242, {
    fill: 0x071312,
    accent: 0xf2cf7d,
    fillAlpha: 0.68,
    strokeAlpha: 0.9,
    cut: 22,
  });
  g.fillStyle(0x2ec4b6, 0.86).fillRect(282, 106, 156, 4);
  g.fillStyle(0xff9f1c, 0.86).fillRect(586, 106, 156, 4);
  g.lineStyle(1, 0xf8f5e9, 0.2);
  g.lineBetween(304, 316, 720, 316);
}

function drawZelligeRail(g: Phaser.GameObjects.Graphics, y: number, alpha: number): void {
  g.fillStyle(0x071312, alpha).fillRect(0, y, 1024, 24);
  g.fillStyle(0xf2cf7d, 0.92);
  for (let x = -16; x < 1040; x += 40) {
    g.fillTriangle(x, y + 24, x + 20, y + 6, x + 40, y + 24);
  }
  g.fillStyle(0x2ec4b6, 0.78).fillRect(0, y + 22, 1024, 2);
}

function drawChampionshipPresentationPanel(g: Phaser.GameObjects.Graphics): void {
  drawNotchedPanel(g, 244, 96, 536, 98, {
    fill: 0x071312,
    accent: 0xf2cf7d,
    fillAlpha: 0.74,
    strokeAlpha: 0.86,
    cut: 14,
  });
  g.fillStyle(0x2ec4b6, 0.78).fillRect(270, 112, 92, 3);
  g.fillStyle(0xff9f1c, 0.78).fillRect(662, 112, 92, 3);
}

function drawTrainingPresentationPanel(g: Phaser.GameObjects.Graphics): void {
  drawNotchedPanel(g, 244, 96, 536, 98, {
    fill: 0x071312,
    accent: 0x2ec4b6,
    fillAlpha: 0.74,
    strokeAlpha: 0.82,
    cut: 14,
  });
  g.fillStyle(0x2ec4b6, 0.76).fillRect(270, 112, 92, 3);
  g.fillStyle(0xfff1a8, 0.72).fillRect(662, 112, 92, 3);
}

function drawPauseOptionsPanel(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x071312, 0.66).fillRect(0, 0, 1024, 576);
  drawNotchedPanel(g, 326, 132, 372, 314, {
    fill: 0x0b1817,
    accent: 0xf2cf7d,
    fillAlpha: 0.98,
    strokeAlpha: 0.92,
    cut: 20,
  });
  drawNotchedPanel(g, 338, 144, 348, 290, {
    fill: 0x071312,
    accent: 0xf8f5e9,
    fillAlpha: 0.12,
    strokeAlpha: 0.24,
    cut: 12,
  });
  g.fillStyle(0xff3434, 0.9).fillRect(370, 160, 100, 4);
  g.fillStyle(0x338dff, 0.9).fillRect(554, 160, 100, 4);
  g.fillStyle(0xfff1a8, 0.95).fillTriangle(488, 184, 512, 154, 536, 184);
  g.fillStyle(0x071312, 1).fillCircle(512, 194, 36);
  g.lineStyle(2, 0xf2cf7d, 0.9).strokeCircle(512, 194, 36);
  g.lineStyle(1, 0xf8f5e9, 0.28).strokeCircle(512, 194, 24);

  const rowX = 382;
  for (let index = 0; index < 4; index += 1) {
    const y = 234 + index * 28;
    const accent = index % 2 === 0 ? 0x2ec4b6 : 0xff9f1c;
    drawNotchedPanel(g, rowX, y, 260, 27, {
      fill: 0xf8f5e9,
      accent,
      fillAlpha: index === 0 ? 0.16 : 0.1,
      strokeAlpha: index === 0 ? 0.64 : 0.36,
      cut: 5,
    });
  }
}

function drawTitlePortraitFrame(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number,
): void {
  drawNotchedPanel(g, x, y, width, height, {
    fill: 0x071312,
    accent,
    fillAlpha: 0.52,
    strokeAlpha: 0.92,
    strokeWidth: 3,
    cut: 18,
  });
  drawNotchedPanel(g, x + 10, y + 10, width - 20, height - 20, {
    fill: 0x071312,
    accent: 0xf2cf7d,
    fillAlpha: 0.08,
    strokeAlpha: 0.62,
    cut: 10,
  });
  g.fillStyle(accent, 0.7).fillTriangle(x + 18, y + 20, x + 52, y + 20, x + 18, y + 54);
  g.fillStyle(accent, 0.7).fillTriangle(x + width - 18, y + height - 20, x + width - 52, y + height - 20, x + width - 18, y + height - 54);
}

function drawSelectionCard(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number,
  side: "left" | "right",
): void {
  drawNotchedPanel(g, x, y, width, height, {
    fill: 0x0b1817,
    accent,
    fillAlpha: 0.66,
    strokeAlpha: 0.72,
    cut: 14,
  });
  drawNotchedPanel(g, x + 12, y + 12, width - 24, height - 24, {
    fill: 0xf8f5e9,
    accent: 0xf2cf7d,
    fillAlpha: 0.06,
    strokeAlpha: 0.32,
    cut: 8,
  });
  g.fillStyle(accent, 0.8).fillTriangle(side === "left" ? x + 18 : x + width - 18, y + 20, x + width / 2, y + 20, side === "left" ? x + 18 : x + width - 18, y + 54);
  g.fillStyle(accent, 0.55).fillRect(x + 26, y + height - 20, width - 52, 3);
}

function drawVsMedallion(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x0b1817, 0.9).fillCircle(x, y, 42);
  g.lineStyle(3, 0xf2cf7d, 0.92).strokeCircle(x, y, 42);
  g.lineStyle(1, 0xf8f5e9, 0.28).strokeCircle(x, y, 30);
}

function keyDown(key?: Phaser.Input.Keyboard.Key): boolean {
  return Boolean(key?.isDown);
}

function drawFighterGroundingShadows(
  g: Phaser.GameObjects.Graphics,
  snapshot: MatchSnapshot,
  visualOffsets: Record<"p1" | "p2", number>,
): void {
  drawFighterGroundingShadow(g, snapshot.p1, visualOffsets.p1);
  drawFighterGroundingShadow(g, snapshot.p2, visualOffsets.p2);
}

function drawFighterGroundingShadow(
  g: Phaser.GameObjects.Graphics,
  fighter: MatchSnapshot["p1"],
  visualOffsetX: number,
): void {
  const airborne = !fighter.grounded || fighter.state === "jump" || fighter.state === "hop";
  const downed = fighter.state === "knockdown";
  const width = downed ? 128 : airborne ? 68 : 92;
  const height = downed ? 20 : airborne ? 10 : 16;
  const alpha = downed ? 0.32 : airborne ? 0.14 : 0.28;
  const y = fighter.y + (downed ? 5 : 4);

  g.fillStyle(0x071312, alpha).fillEllipse(fighter.x + visualOffsetX, y, width, height);
  g.fillStyle(0xf8f5e9, alpha * 0.16).fillEllipse(fighter.x + visualOffsetX, y - 1, width * 0.58, height * 0.45);
}

function drawActionEffects(
  g: Phaser.GameObjects.Graphics,
  snapshot: MatchSnapshot,
  visualOffsets: Record<"p1" | "p2", number>,
): void {
  drawFighterActionEffect(g, snapshot.p1, 0x2ec4b6, visualOffsets.p1);
  drawFighterActionEffect(g, snapshot.p2, 0xff9f1c, visualOffsets.p2);
}

function drawFighterActionEffect(
  g: Phaser.GameObjects.Graphics,
  fighter: MatchSnapshot["p1"],
  color: number,
  visualOffsetX: number,
): void {
  const rollCue = fighterRollMotionCue(fighter);
  if (rollCue) {
    const alpha = rollCue.alpha;
    if (alpha <= 0.02) return;

    const leadX = rollCue.leadX + visualOffsetX;
    const trailX = rollCue.trailX + visualOffsetX;
    const y = rollCue.y;
    const dustY = fighter.y - 9;
    g.fillStyle(0xf8f5e9, alpha * 0.18).fillEllipse(trailX, dustY, 66, 18);
    g.fillStyle(0xfff1a8, alpha * 0.12).fillEllipse(leadX, dustY - 4, 42, 12);
    g.lineStyle(7, 0xf8f5e9, alpha * 0.52).lineBetween(trailX, y + 6, leadX, y - 4);
    g.lineStyle(4, color, alpha * 0.74).lineBetween(trailX + rollCue.direction * 12, y + 16, leadX, y + 4);
    g.lineStyle(2, 0xff9f1c, alpha * 0.68).strokeCircle(leadX - rollCue.direction * 8, y + 10, 18 + rollCue.progress * 10);
    return;
  }

  const mobilityCue = fighterMobilityMotionCue(fighter);
  if (mobilityCue) {
    const alpha = mobilityCue.alpha;
    if (alpha <= 0.02) return;

    const direction = mobilityCue.direction;
    const visualX = fighter.x + visualOffsetX;
    const leadX = mobilityCue.leadX + visualOffsetX;
    const trailX = mobilityCue.trailX + visualOffsetX;
    const y = mobilityCue.y;
    const dustY = mobilityCue.dustY;
    const highlight = mobilityCue.kind === "hop" ? 0xfff1a8 : 0xf8f5e9;
    const accent = mobilityCue.kind === "backdash" ? 0x4d96ff : color;

    if (mobilityCue.kind === "hop") {
      g.fillStyle(0xf8f5e9, alpha * 0.16).fillEllipse(visualX - direction * 34, dustY, 66, 16);
      g.lineStyle(7, highlight, alpha * 0.52).lineBetween(trailX, y + 22, visualX - direction * 4, y - 8);
      g.lineStyle(4, accent, alpha * 0.72).lineBetween(trailX + direction * 12, y + 34, leadX, y + 10);
      g.lineStyle(2, 0xff9f1c, alpha * 0.58).strokeCircle(visualX - direction * 22, dustY - 12, 16 + mobilityCue.progress * 8);
      return;
    }

    g.fillStyle(0xf8f5e9, alpha * 0.18).fillEllipse(visualX - direction * 44, dustY, 84, 18);
    g.fillStyle(0xfff1a8, alpha * 0.14).fillEllipse(leadX - direction * 18, dustY - 4, 46, 12);
    g.lineStyle(3, highlight, alpha * 0.46).lineBetween(
      trailX - direction * 26,
      fighter.y - 132,
      visualX - direction * 44,
      fighter.y - 138,
    );
    g.lineStyle(2, accent, alpha * 0.7).lineBetween(
      trailX - direction * 12,
      fighter.y - 104,
      visualX - direction * 28,
      fighter.y - 110,
    );
    g.lineStyle(8, highlight, alpha * 0.48).lineBetween(trailX, y + 6, leadX, y - 8);
    g.lineStyle(5, accent, alpha * 0.78).lineBetween(trailX - direction * 14, y + 24, leadX - direction * 24, y + 10);
    g.lineStyle(3, 0xff9f1c, alpha * 0.54).lineBetween(trailX - direction * 22, y + 44, visualX - direction * 16, y + 28);
    return;
  }

  const plan = actionEffectPlan(fighter.state);
  if (!plan) return;

  const progress = Math.min(1, fighter.stateFrame / plan.duration);
  const strike = Math.sin(progress * Math.PI);
  const alpha = Math.max(0, 0.72 - Math.abs(progress - 0.52) * 0.9);
  if (alpha <= 0.02) return;

  const facing = fighter.facing;
  const visualX = fighter.x + visualOffsetX;
  const startX = visualX + facing * plan.startX;
  const endX = visualX + facing * (plan.endX + strike * plan.extraReach);
  const y = fighter.y + plan.y;
  const highlight = plan.kind === "special" || plan.kind === "super" ? 0xfff1a8 : 0xf8f5e9;

  if (plan.kind === "kick") {
    g.fillStyle(highlight, alpha * 0.16).fillTriangle(startX, y - 12, endX, y + 2, endX - facing * 24, y + 24);
    g.lineStyle(7, highlight, alpha * 0.76).lineBetween(startX, y, endX, y + 4);
    g.lineStyle(3, color, alpha).lineBetween(startX - facing * 8, y + 10, endX - facing * 18, y + 18);
    return;
  }

  if (plan.kind === "special" || plan.kind === "super") {
    const superScale = plan.kind === "super" ? 1.55 : 1;
    g.fillStyle(0xfff1a8, alpha * (plan.kind === "super" ? 0.34 : 0.26)).fillCircle(endX, y, (18 + strike * 10) * superScale);
    g.lineStyle(plan.kind === "super" ? 8 : 5, color, alpha).strokeCircle(endX, y, (22 + strike * 14) * superScale);
    g.lineStyle(5, highlight, alpha * 0.78).lineBetween(startX, y + 8, endX, y - 4);
    g.lineStyle(3, 0xff9f1c, alpha).lineBetween(startX - facing * 10, y + 20, endX - facing * 30, y + 26);
    return;
  }

  g.fillStyle(highlight, alpha * 0.14).fillTriangle(startX, y - 18, endX, y - 2, endX - facing * 28, y + 18);
  g.lineStyle(plan.kind === "heavy" ? 7 : 5, highlight, alpha * 0.76).lineBetween(startX, y, endX, y - 4);
  g.lineStyle(3, color, alpha).lineBetween(startX - facing * 6, y + 10, endX - facing * 18, y + 14);
}

function actionEffectPlan(
  state: MatchSnapshot["p1"]["state"],
):
  | { kind: "light" | "heavy" | "kick" | "special" | "super"; duration: number; startX: number; endX: number; extraReach: number; y: number }
  | null {
  if (state === "lightAttack") {
    return { kind: "light", duration: 18, startX: 26, endX: 82, extraReach: 8, y: -176 };
  }
  if (state === "heavyAttack") {
    return { kind: "heavy", duration: 30, startX: 30, endX: 102, extraReach: 14, y: -178 };
  }
  if (state === "lightKick") {
    return { kind: "kick", duration: 22, startX: 18, endX: 100, extraReach: 12, y: -118 };
  }
  if (state === "specialAttack") {
    return { kind: "special", duration: 42, startX: 30, endX: 116, extraReach: 18, y: -174 };
  }
  if (state === "superAttack") {
    return { kind: "super", duration: 62, startX: 24, endX: 146, extraReach: 30, y: -174 };
  }
  return null;
}

function drawStage(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x163936, 1).fillRect(0, 0, 1024, 576);
  g.fillStyle(0x275a4f, 1).fillRect(0, 376, 1024, 200);
  g.fillStyle(0xd6b56d, 1).fillRect(0, 456, 1024, 120);
  g.fillStyle(0x2f6f63, 1).fillRect(64, 108, 896, 22);
  g.fillStyle(0xf2cf7d, 1);
  for (let x = 88; x < 936; x += 56) {
    g.fillTriangle(x, 108, x + 28, 72, x + 56, 108);
  }
  g.lineStyle(2, 0x102523, 0.75);
  for (let x = 0; x <= 1024; x += 48) {
    g.lineBetween(x, 456, x + 32, 576);
  }
  g.lineStyle(4, 0x513b24, 1).strokeRect(64, 84, 896, 392);
}

function drawRuntimeHudMeters(g: Phaser.GameObjects.Graphics, snapshot: MatchSnapshot, matchSet: MatchSetState): void {
  const p1Ratio = Phaser.Math.Clamp(snapshot.p1.health / 1000, 0, 1);
  const p2Ratio = Phaser.Math.Clamp(snapshot.p2.health / 1000, 0, 1);
  const p1PowerRatio = Phaser.Math.Clamp(snapshot.p1.meter / POWER_METER_MAX, 0, 1);
  const p2PowerRatio = Phaser.Math.Clamp(snapshot.p2.meter / POWER_METER_MAX, 0, 1);

  g.fillStyle(0x071312, 0.9).fillCircle(512, 56, 24);
  g.lineStyle(2, 0xf2cf7d, 0.8).strokeCircle(512, 56, 24);
  drawMeterBar(g, { x: 112, y: 52, width: 326, height: 17, ratio: p1Ratio, direction: 1 }, 0x31090b, 0xff3434, 0xfff1a8);
  drawMeterBar(g, { x: 586, y: 52, width: 326, height: 17, ratio: p2Ratio, direction: -1 }, 0x071a38, 0x338dff, 0xe2f1ff);
  drawMeterBar(g, { x: 250, y: 522, width: 224, height: 12, ratio: p1PowerRatio, direction: 1 }, 0x122617, 0xb7ff2d, 0xfff1a8);
  drawMeterBar(g, { x: 550, y: 522, width: 224, height: 12, ratio: p2PowerRatio, direction: -1 }, 0x10243b, 0x4bdcff, 0xe2f1ff);

  drawPowerStocks(g, 274, 542, snapshot.p1.meter, 1);
  drawPowerStocks(g, 750, 542, snapshot.p2.meter, -1);
  drawScorePips(g, 114, 88, matchSet.wins.p1, matchSet.targetWins, 0xff3434);
  drawScorePips(g, 910, 88, matchSet.wins.p2, matchSet.targetWins, 0x338dff, -1);
}

function drawHud(g: Phaser.GameObjects.Graphics, snapshot: MatchSnapshot, matchSet: MatchSetState): void {
  const p1Ratio = snapshot.p1.health / 1000;
  const p2Ratio = snapshot.p2.health / 1000;
  const p1PowerRatio = snapshot.p1.meter / POWER_METER_MAX;
  const p2PowerRatio = snapshot.p2.meter / POWER_METER_MAX;
  drawNotchedPanel(g, 56, 18, 912, 76, {
    fill: 0x071312,
    accent: 0xf2cf7d,
    fillAlpha: 0.88,
    strokeAlpha: 0.48,
    cut: 10,
  });
  drawMeterBar(g, { x: 100, y: 44, width: 338, height: 18, ratio: p1Ratio, direction: 1 }, 0x142522, 0xff3434, 0xfff1a8);
  drawMeterBar(g, { x: 586, y: 44, width: 338, height: 18, ratio: p2Ratio, direction: -1 }, 0x142522, 0x338dff, 0xe2f1ff);
  drawMeterBar(g, { x: 100, y: 66, width: 338, height: 8, ratio: p1PowerRatio, direction: 1 }, 0x0b1817, 0xfff1a8, 0xf8f5e9);
  drawMeterBar(g, { x: 586, y: 66, width: 338, height: 8, ratio: p2PowerRatio, direction: -1 }, 0x0b1817, 0xfff1a8, 0xf8f5e9);
  drawPowerStocks(g, 444, 67, snapshot.p1.meter, 1);
  drawPowerStocks(g, 580, 67, snapshot.p2.meter, -1);
  g.fillStyle(0xf2cf7d, 1).fillCircle(512, 54, 28);
  g.fillStyle(0x0b1817, 1).fillCircle(512, 54, 22);
  drawScorePips(g, 104, 74, matchSet.wins.p1, matchSet.targetWins, 0xff3434);
  drawScorePips(g, 902, 74, matchSet.wins.p2, matchSet.targetWins, 0x338dff, -1);
}

function drawMeterBar(
  g: Phaser.GameObjects.Graphics,
  input: { x: number; y: number; width: number; height: number; ratio: number; direction: 1 | -1 },
  track: number,
  fill: number,
  shine: number,
): void {
  const plan = meterFillPlan(input);
  g.fillStyle(0x071312, 0.54).fillRoundedRect(input.x - 2, input.y - 2, input.width + 4, input.height + 4, 3);
  g.fillStyle(track, 0.88).fillRoundedRect(input.x, input.y, input.width, input.height, 2);
  g.lineStyle(1, 0xf8f5e9, 0.18).strokeRoundedRect(input.x, input.y, input.width, input.height, 2);
  if (plan.width > 0) {
    g.fillStyle(fill, 0.98).fillRoundedRect(plan.x, plan.y, plan.width, plan.height, 2);
    g.fillStyle(shine, 0.38).fillRect(plan.x + 4, plan.y + 2, Math.max(0, plan.width - 8), Math.max(2, Math.round(plan.height * 0.24)));
  }
  g.lineStyle(1, 0x071312, 0.32);
  for (let tick = 1; tick < 4; tick += 1) {
    const x = input.x + (input.width / 4) * tick;
    g.lineBetween(x, input.y + 2, x - input.direction * 4, input.y + input.height - 2);
  }
}

function drawPowerStocks(g: Phaser.GameObjects.Graphics, x: number, y: number, meter: number, direction: 1 | -1): void {
  const fullStocks = Math.floor(meter / POWER_METER_STOCK);
  for (let index = 0; index < POWER_METER_MAX / POWER_METER_STOCK; index += 1) {
    const left = x + index * 13 * direction;
    g.lineStyle(1, 0xfff1a8, 0.7).strokeRect(direction === 1 ? left : left - 8, y, 8, 4);
    if (index < fullStocks) {
      g.fillStyle(0xfff1a8, 0.96).fillRect(direction === 1 ? left + 1 : left - 7, y + 1, 6, 2);
    }
  }
}

function drawScorePips(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  wins: number,
  targetWins: number,
  color: number,
  direction = 1,
): void {
  for (let index = 0; index < targetWins; index += 1) {
    const centerX = x + index * 18 * direction;
    g.lineStyle(1, 0xf8f5e9, 0.7).strokeCircle(centerX, y, 5);
    if (index < wins) {
      g.fillStyle(color, 1).fillCircle(centerX, y, 4);
    }
  }
}

function hudCenterLabel(snapshot: MatchSnapshot, matchSet: MatchSetState): string {
  if (matchSet.status === "complete") return "FT";
  if (snapshot.status === "round-over") return "KO";
  return String(snapshot.roundTimer).padStart(2, "0");
}

function roundLabel(matchSet: MatchSetState): string {
  return matchSet.status === "complete" ? "MATCH" : `ROUND ${matchSet.round}`;
}

function roundResultLabel(snapshot: MatchSnapshot): string {
  if (snapshot.status === "round-over") {
    if (snapshot.winner === "draw") return "DRAW";
    return `${snapshot.winner?.toUpperCase()} WINS ROUND`;
  }
  return String(snapshot.roundTimer).padStart(2, "0");
}

function matchResultLabel(matchSet: MatchSetState): string {
  if (matchSet.matchWinner === "draw" || !matchSet.matchWinner) return "MATCH DRAW";
  return `${matchSet.matchWinner.toUpperCase()} WINS MATCH`;
}

function drawFighter(
  g: Phaser.GameObjects.Graphics,
  fighter: MatchSnapshot["p1"],
  color: number,
  hurtbox: { x: number; y: number; width: number; height: number },
  hitboxes: readonly { x: number; y: number; width: number; height: number }[],
): void {
  g.fillStyle(color, 1).fillRoundedRect(fighter.x - 22, fighter.y - 112, 44, 112, 10);
  g.fillStyle(0xf8f5e9, 1).fillCircle(fighter.x + 8 * fighter.facing, fighter.y - 126, 18);
  g.fillStyle(0x111918, 1).fillCircle(fighter.x + 14 * fighter.facing, fighter.y - 130, 3);
  g.lineStyle(2, 0xf8f5e9, 1).lineBetween(fighter.x, fighter.y - 72, fighter.x + 42 * fighter.facing, fighter.y - 84);
  g.lineStyle(1, 0x2f80ed, 0.7).strokeRect(hurtbox.x, hurtbox.y, hurtbox.width, hurtbox.height);
  g.lineStyle(2, 0xff3366, 0.9);
  for (const hitbox of hitboxes) {
    g.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
  }
}
