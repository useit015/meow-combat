import { createInput } from "./input";
import type { FighterState, HorizontalIntent, InputSnapshot, MatchSnapshot, PlayerId } from "./types";

export type CpuDifficulty = "easy" | "normal" | "hard";

export interface CpuControllerOptions {
  difficulty?: CpuDifficulty;
  preferredRange?: number;
  pressureRange?: number;
  reactionRange?: number;
  lightAttackInterval?: number;
  heavyAttackInterval?: number;
}

interface CpuProfile {
  preferredRange: number;
  pressureRange: number;
  reactionRange: number;
  lightAttackInterval: number;
  heavyAttackInterval: number;
}

export const CPU_PROFILES: Readonly<Record<CpuDifficulty, CpuProfile>> = {
  easy: {
    preferredRange: 108,
    pressureRange: 118,
    reactionRange: 112,
    lightAttackInterval: 84,
    heavyAttackInterval: 144,
  },
  normal: {
    preferredRange: 92,
    pressureRange: 132,
    reactionRange: 150,
    lightAttackInterval: 54,
    heavyAttackInterval: 96,
  },
  hard: {
    preferredRange: 78,
    pressureRange: 150,
    reactionRange: 190,
    lightAttackInterval: 42,
    heavyAttackInterval: 78,
  },
};

const DEFAULT_CPU_OPTIONS = {
  preferredRange: 92,
  pressureRange: 132,
  reactionRange: 150,
  lightAttackInterval: 54,
  heavyAttackInterval: 96,
} satisfies CpuProfile;

export function createCpuInput(
  snapshot: MatchSnapshot,
  player: PlayerId,
  frame: number,
  options: CpuControllerOptions = {},
): InputSnapshot {
  const { difficulty = "normal", ...overrides } = options;
  const config = { ...DEFAULT_CPU_OPTIONS, ...CPU_PROFILES[difficulty], ...overrides };
  const self = snapshot[player];
  const opponent = snapshot[otherPlayer(player)];
  const delta = opponent.x - self.x;
  const distance = Math.abs(delta);
  const approach = directionToward(delta);

  if (distance <= config.reactionRange && isAttacking(opponent.state)) {
    return createInput(frame, {
      horizontal: 0,
      buttons: {
        guard: true,
      },
    });
  }

  if (distance > config.pressureRange) {
    return createInput(frame, {
      horizontal: approach,
    });
  }

  return createInput(frame, {
    horizontal: distance > config.preferredRange ? approach : 0,
    buttons: {
      light: shouldPressOnInterval(frame, config.lightAttackInterval),
      heavy: shouldPressOnInterval(frame, config.heavyAttackInterval),
      special: self.meter >= 1000 && shouldPressOnInterval(frame, config.heavyAttackInterval * 2),
    },
  });
}

function otherPlayer(player: PlayerId): PlayerId {
  return player === "p1" ? "p2" : "p1";
}

function directionToward(delta: number): HorizontalIntent {
  if (delta > 4) return 1;
  if (delta < -4) return -1;
  return 0;
}

function isAttacking(state: FighterState): boolean {
  return (
    state === "lightAttack" ||
    state === "lightKick" ||
    state === "heavyAttack" ||
    state === "specialAttack" ||
    state === "superAttack"
  );
}

function shouldPressOnInterval(frame: number, interval: number): boolean {
  return interval > 0 && frame % interval === 0;
}
