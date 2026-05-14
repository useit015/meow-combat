import type { MatchSnapshot } from "../core";
import type { MatchSetStatus } from "../core";

export type ShellPhase = "ready" | "select" | "fighting" | "paused" | "round-over" | "match-over";

export interface ShellState {
  phase: ShellPhase;
}

export interface ShellInput {
  startPressed?: boolean;
  pausePressed?: boolean;
  resetPressed?: boolean;
  matchStatus: MatchSnapshot["status"];
  matchSetStatus?: MatchSetStatus;
}

export const initialShellState: ShellState = {
  phase: "ready",
};

export function reduceShellState(state: ShellState, input: ShellInput): ShellState {
  if (input.resetPressed) {
    return initialShellState;
  }

  if (state.phase === "paused") {
    return input.pausePressed ? { phase: "fighting" } : state;
  }

  if (state.phase === "ready") {
    return input.startPressed ? { phase: "select" } : state;
  }

  if (state.phase === "select") {
    return input.startPressed ? { phase: "fighting" } : state;
  }

  if (state.phase === "fighting" && input.matchStatus === "round-over") {
    return input.matchSetStatus === "complete" ? { phase: "match-over" } : { phase: "round-over" };
  }

  if (state.phase === "fighting" && input.pausePressed) {
    return { phase: "paused" };
  }

  if (state.phase === "round-over" && input.startPressed) {
    return { phase: "fighting" };
  }

  if (state.phase === "match-over" && input.startPressed) {
    return { phase: "fighting" };
  }

  return state;
}
