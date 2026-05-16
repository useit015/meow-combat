import type { MatchSnapshot } from "../core";
import type { MatchSetStatus } from "../core";
import { petFighterGameBible } from "../content";

export type ShellPhase = "ready" | "mode-select" | "select" | "fighting" | "paused" | "round-over" | "match-over";
export type ArcadePlayMode = "versus-cpu" | "training" | "championship" | "local-versus";

export interface ShellState {
  phase: ShellPhase;
  selectedMode?: ArcadePlayMode;
}

export interface ShellInput {
  startPressed?: boolean;
  pausePressed?: boolean;
  resetPressed?: boolean;
  modeNextPressed?: boolean;
  modePreviousPressed?: boolean;
  matchStatus: MatchSnapshot["status"];
  matchSetStatus?: MatchSetStatus;
}

const PLAY_MODES = ["versus-cpu", "training", "championship", "local-versus"] as const satisfies readonly ArcadePlayMode[];
const DEFAULT_PLAY_MODE: ArcadePlayMode = "versus-cpu";

export const initialShellState: ShellState = {
  phase: "ready",
  selectedMode: DEFAULT_PLAY_MODE,
};

export function reduceShellState(state: ShellState, input: ShellInput): ShellState {
  const selectedMode = selectedPlayMode(state);

  if (input.resetPressed) {
    return initialShellState;
  }

  if (state.phase === "paused") {
    return input.pausePressed ? { phase: "fighting", selectedMode } : withSelectedMode(state);
  }

  if (state.phase === "ready") {
    return input.startPressed ? { phase: "mode-select", selectedMode } : withSelectedMode(state);
  }

  if (state.phase === "mode-select") {
    const nextMode =
      input.modeNextPressed || input.modePreviousPressed
        ? cyclePlayMode(selectedMode, input.modeNextPressed ? 1 : -1)
        : selectedMode;
    return input.startPressed ? { phase: "select", selectedMode: nextMode } : { phase: "mode-select", selectedMode: nextMode };
  }

  if (state.phase === "select") {
    return input.startPressed ? { phase: "fighting", selectedMode } : withSelectedMode(state);
  }

  if (state.phase === "fighting" && input.matchStatus === "round-over") {
    if (selectedMode === "training") return { phase: "fighting", selectedMode };
    return input.matchSetStatus === "complete"
      ? { phase: "match-over", selectedMode }
      : { phase: "round-over", selectedMode };
  }

  if (state.phase === "fighting" && input.pausePressed) {
    return { phase: "paused", selectedMode };
  }

  if (state.phase === "round-over" && input.startPressed) {
    return { phase: "fighting", selectedMode };
  }

  if (state.phase === "match-over" && input.startPressed) {
    return { phase: "fighting", selectedMode };
  }

  return withSelectedMode(state);
}

export function selectedPlayMode(state: Pick<ShellState, "selectedMode">): ArcadePlayMode {
  return state.selectedMode ?? DEFAULT_PLAY_MODE;
}

export function shellModeLabel(state: Pick<ShellState, "selectedMode">): string {
  const mode = selectedPlayMode(state);
  if (mode === "training") return "TRAINING";
  if (mode === "championship") return "CHAMPIONSHIP";
  if (mode === "local-versus") return "LOCAL VERSUS";
  return "1 VS CPU";
}

export function shellModeDescription(state: Pick<ShellState, "selectedMode">): string {
  const mode = selectedPlayMode(state);
  if (mode === "training") return "Endless practice lab for timing, spacing, combo feedback, and dummy status.";
  if (mode === "championship") return petFighterGameBible.championship.firstStoryBeat;
  if (mode === "local-versus") return "Same-keyboard PvP fight for two local players using the current runtime roster.";
  return "Best-of-three CPU fight using the current roster and difficulty setting.";
}

export function playModeUsesCpu(state: Pick<ShellState, "selectedMode">): boolean {
  return selectedPlayMode(state) !== "training" && selectedPlayMode(state) !== "local-versus";
}

function withSelectedMode(state: ShellState): ShellState {
  return { ...state, selectedMode: selectedPlayMode(state) };
}

function cyclePlayMode(current: ArcadePlayMode, direction: -1 | 1): ArcadePlayMode {
  const index = PLAY_MODES.indexOf(current);
  return PLAY_MODES[(index + direction + PLAY_MODES.length) % PLAY_MODES.length];
}
