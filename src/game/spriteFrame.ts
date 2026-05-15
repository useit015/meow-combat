import type { FighterAnimationId } from "../assets";

type FramePlan =
  | { mode: "loop"; cadence: number; sequence: readonly number[]; motion?: SpriteMotion }
  | { mode: "timeline"; keyframes: readonly TimelineKeyframe[]; motion?: SpriteMotion }
  | { mode: "hold"; frame: number; motion?: SpriteMotion };

type SpriteMotion =
  | "breathe"
  | "walk"
  | "crouch"
  | "jump"
  | "attack"
  | "kick"
  | "special"
  | "recoil"
  | "down"
  | "present";

interface TimelineKeyframe {
  until: number;
  frame: number;
}

export interface SpritePose {
  frame: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export type SpriteStanceConvention = "upright-two-legged" | "grounded-prone-reaction";

const GROUNDED_OR_PRONE_ANIMATIONS = new Set<FighterAnimationId>(["knockdown", "lose"]);
const STABLE_FRAME_SCALE: Partial<Record<FighterAnimationId, readonly number[]>> = {
  jump: [1.38, 1.14, 1.2, 1.34, 1.16, 1.38],
  blockstun: [1, 1.08, 1.12, 1.05, 1],
};

const FRAME_PLANS: Readonly<Record<FighterAnimationId, FramePlan>> = {
  idle: { mode: "loop", cadence: 12, sequence: [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1], motion: "breathe" },
  "walk-forward": { mode: "loop", cadence: 5, sequence: [0, 1, 2, 3, 4, 5, 6, 7], motion: "walk" },
  "walk-back": { mode: "loop", cadence: 6, sequence: [7, 6, 5, 4, 3, 2, 1, 0], motion: "walk" },
  crouch: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3], 4), motion: "crouch" },
  jump: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5], 7), motion: "jump" },
  "light-punch": { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5], 3), motion: "attack" },
  "heavy-punch": { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5, 6, 7], 4), motion: "attack" },
  "light-kick": { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5, 6, 7], 3), motion: "kick" },
  special: { mode: "timeline", keyframes: frameSteps([0, 1, 6, 6, 8, 9], 7), motion: "special" },
  hitstun: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4], 4), motion: "recoil" },
  blockstun: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4], 3), motion: "recoil" },
  knockdown: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5, 6, 7], 5), motion: "down" },
  win: { mode: "loop", cadence: 14, sequence: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2], motion: "present" },
  lose: { mode: "timeline", keyframes: frameSteps([0, 1, 2, 3, 4, 5], 8), motion: "down" },
};

export function selectSpriteFrame(animationId: FighterAnimationId, stateFrame: number, frameCount: number): number {
  return selectSpritePose(animationId, stateFrame, frameCount).frame;
}

export function spriteStanceConventionForAnimation(animationId: FighterAnimationId): SpriteStanceConvention {
  return GROUNDED_OR_PRONE_ANIMATIONS.has(animationId) ? "grounded-prone-reaction" : "upright-two-legged";
}

export function selectSpritePose(animationId: FighterAnimationId, stateFrame: number, frameCount: number): SpritePose {
  const safeFrameCount = Math.max(1, Math.floor(frameCount));
  const safeStateFrame = Math.max(0, Math.floor(stateFrame));
  const plan = FRAME_PLANS[animationId];
  const basePose: SpritePose = {
    frame: 0,
    offsetX: 0,
    offsetY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };

  if (safeFrameCount === 1) return basePose;

  return applyMotion(
    {
      ...basePose,
      frame: selectPlannedFrame(plan, safeStateFrame, safeFrameCount),
    },
    plan.motion,
    safeStateFrame,
    animationId,
  );
}

function selectPlannedFrame(plan: FramePlan, stateFrame: number, frameCount: number): number {
  if (plan.mode === "hold") {
    return clampFrame(plan.frame, frameCount);
  }

  if (plan.mode === "loop") {
    const sequence = plan.sequence.filter((frame) => frame >= 0 && frame < frameCount);
    const safeSequence = sequence.length > 0 ? sequence : [0];
    return safeSequence[Math.floor(stateFrame / Math.max(1, plan.cadence)) % safeSequence.length];
  }

  const keyframe = plan.keyframes.find((candidate) => stateFrame < candidate.until) ?? plan.keyframes.at(-1);
  return clampFrame(keyframe?.frame ?? 0, frameCount);
}

function applyMotion(
  pose: SpritePose,
  motion: SpriteMotion | undefined,
  stateFrame: number,
  animationId: FighterAnimationId,
): SpritePose {
  if (motion === "breathe") {
    const wave = Math.sin((stateFrame / 54) * Math.PI * 2);
    return stabilizePose(animationId, {
      ...pose,
      offsetY: -1.5 - wave * 1.5,
    });
  }

  if (motion === "walk") {
    const step = Math.sin((stateFrame / 24) * Math.PI * 2);
    return stabilizePose(animationId, {
      ...pose,
      offsetY: -Math.abs(step) * 2.5,
      rotation: step * (animationId === "walk-back" ? -0.35 : 0.35),
    });
  }

  if (motion === "attack") {
    const duration = attackDuration(animationId);
    const progress = Math.min(1, stateFrame / duration);
    const strike = Math.sin(progress * Math.PI);
    return stabilizePose(animationId, {
      ...pose,
      offsetX: strike * attackReach(animationId),
      offsetY: -strike * 1,
      rotation: strike * attackTilt(animationId),
    });
  }

  if (motion === "kick") {
    const progress = Math.min(1, stateFrame / attackDuration(animationId));
    const strike = Math.sin(progress * Math.PI);
    return stabilizePose(animationId, {
      ...pose,
      offsetX: strike * 5,
      offsetY: -strike * 1.5,
      rotation: -strike * 0.5,
    });
  }

  if (motion === "special") {
    const progress = Math.min(1, stateFrame / attackDuration(animationId));
    const strike = Math.sin(progress * Math.PI);
    return stabilizePose(animationId, {
      ...pose,
      offsetX: strike * 7,
      offsetY: -strike * 2,
      rotation: Math.sin(progress * Math.PI * 2) * 0.8,
    });
  }

  if (motion === "recoil") {
    const recoil = Math.max(0, 1 - stateFrame / 18);
    return stabilizePose(animationId, {
      ...pose,
      offsetX: -recoil * 10,
      offsetY: -recoil * 2,
      rotation: -recoil * 3,
    });
  }

  if (motion === "down") {
    return stabilizePose(animationId, {
      ...pose,
      offsetY: 2,
    });
  }

  if (motion === "present") {
    const wave = Math.sin((stateFrame / 72) * Math.PI * 2);
    return stabilizePose(animationId, {
      ...pose,
      offsetY: -1 + wave * 1,
    });
  }

  return stabilizePose(animationId, pose);
}

function stabilizePose(animationId: FighterAnimationId, pose: SpritePose): SpritePose {
  const frameScales = STABLE_FRAME_SCALE[animationId];
  const scale = frameScales?.[pose.frame] ?? 1;
  return {
    ...pose,
    scaleX: scale,
    scaleY: scale,
  };
}

function attackDuration(animationId: FighterAnimationId): number {
  if (animationId === "light-punch") return 18;
  if (animationId === "light-kick") return 22;
  if (animationId === "heavy-punch") return 30;
  if (animationId === "special") return 42;
  return 24;
}

function attackReach(animationId: FighterAnimationId): number {
  if (animationId === "light-punch") return 4;
  if (animationId === "heavy-punch") return 6;
  return 3;
}

function attackTilt(animationId: FighterAnimationId): number {
  if (animationId === "heavy-punch") return 0.8;
  return 0.5;
}

function clampFrame(frame: number, frameCount: number): number {
  return Math.min(frameCount - 1, Math.max(0, Math.floor(frame)));
}

function frameSteps(frames: readonly number[], cadence: number): readonly TimelineKeyframe[] {
  return frames.map((frame, index) => ({
    frame,
    until: (index + 1) * cadence,
  }));
}
