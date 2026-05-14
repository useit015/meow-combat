import type { PlayerId, Winner } from "./types";

export type MatchSetStatus = "in-progress" | "complete";

export interface MatchSetState {
  round: number;
  targetWins: number;
  wins: Record<PlayerId, number>;
  lastRoundWinner: Winner;
  matchWinner: Winner;
  status: MatchSetStatus;
}

export function createMatchSet(options: { targetWins?: number } = {}): MatchSetState {
  const targetWins = options.targetWins ?? 2;
  return {
    round: 1,
    targetWins,
    wins: {
      p1: 0,
      p2: 0,
    },
    lastRoundWinner: null,
    matchWinner: null,
    status: "in-progress",
  };
}

export function recordRoundOutcome(state: MatchSetState, winner: Winner): MatchSetState {
  if (state.status === "complete") {
    return state;
  }

  const wins = { ...state.wins };
  if (winner === "p1" || winner === "p2") {
    wins[winner] += 1;
  }

  const matchWinner = resolveMatchWinner(wins, state.targetWins);
  return {
    ...state,
    round: matchWinner ? state.round : state.round + 1,
    wins,
    lastRoundWinner: winner,
    matchWinner,
    status: matchWinner ? "complete" : "in-progress",
  };
}

function resolveMatchWinner(wins: Record<PlayerId, number>, targetWins: number): PlayerId | null {
  if (wins.p1 >= targetWins) return "p1";
  if (wins.p2 >= targetWins) return "p2";
  return null;
}
