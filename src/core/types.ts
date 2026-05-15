export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;

export type PlayerId = "p1" | "p2";
export type Facing = -1 | 1;
export type HorizontalIntent = -1 | 0 | 1;
export type VerticalIntent = -1 | 0 | 1;

export type AttackButton = "light" | "kick" | "heavy" | "special";
export type DefenseButton = "guard";
export type MobilityButton = "jump" | "crouch";
export type Button = AttackButton | DefenseButton | MobilityButton;

export type CommandId = "light" | "lightKick" | "heavy" | "special" | "super";
export type MobilityCommandId = "runForward" | "backdash" | "rollForward" | "rollBack";
export type MatchStatus = "fighting" | "round-over";
export type Winner = PlayerId | "draw" | null;

export type FighterState =
  | "idle"
  | "walkForward"
  | "walkBack"
  | "crouch"
  | "jump"
  | "hop"
  | "runForward"
  | "backdash"
  | "rollForward"
  | "rollBack"
  | "lightAttack"
  | "lightKick"
  | "heavyAttack"
  | "specialAttack"
  | "superAttack"
  | "hitstun"
  | "blockstun"
  | "knockdown";

export interface InputSnapshot {
  frame: number;
  horizontal: HorizontalIntent;
  vertical: VerticalIntent;
  buttons: Readonly<Record<Button, boolean>>;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HitVolume {
  frameStart: number;
  frameEnd: number;
  rect: Rect;
}

export interface MoveDefinition {
  id: CommandId;
  state: Extract<FighterState, "lightAttack" | "lightKick" | "heavyAttack" | "specialAttack" | "superAttack">;
  duration: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  pushback: number;
  attackerFreeze: number;
  defenderFreeze: number;
  meterGainOnUse: number;
  meterGainOnHit: number;
  meterGainOnBlock: number;
  hitVolumes: readonly HitVolume[];
}

export interface FighterDefinition {
  id: string;
  displayName: string;
  maxHealth: number;
  walkSpeed: number;
  jumpVelocity: number;
  hurtbox: Rect;
  moves: Readonly<Record<CommandId, MoveDefinition>>;
}

export interface FighterRuntime {
  id: PlayerId;
  definition: FighterDefinition;
  x: number;
  y: number;
  velocityY: number;
  facing: Facing;
  health: number;
  meter: number;
  state: FighterState;
  stateFrame: number;
  hitstop: number;
  stunRemaining: number;
  lastHitFrame: number | null;
  grounded: boolean;
  guarding: boolean;
}

export interface ComboState {
  attacker: PlayerId | null;
  defender: PlayerId | null;
  count: number;
  damage: number;
  lastHitFrame: number | null;
}

export interface MatchRuntime {
  frame: number;
  roundTimer: number;
  status: MatchStatus;
  winner: Winner;
  combo: ComboState;
  groundY: number;
  bounds: Rect;
  p1: FighterRuntime;
  p2: FighterRuntime;
  events: readonly CombatEvent[];
}

export type CombatEvent =
  | {
      type: "hit";
      frame: number;
      attacker: PlayerId;
      defender: PlayerId;
      move: CommandId;
      damage: number;
    }
  | {
      type: "block";
      frame: number;
      attacker: PlayerId;
      defender: PlayerId;
      move: CommandId;
    }
  | {
      type: "state";
      frame: number;
      fighter: PlayerId;
      from: FighterState;
      to: FighterState;
    };

export interface MatchSnapshot {
  frame: number;
  roundTimer: number;
  status: MatchStatus;
  winner: Winner;
  combo: ComboState;
  p1: FighterSnapshot;
  p2: FighterSnapshot;
  events: readonly CombatEvent[];
}

export interface FighterSnapshot {
  id: PlayerId;
  character: string;
  x: number;
  y: number;
  facing: Facing;
  health: number;
  meter: number;
  state: FighterState;
  stateFrame: number;
  hitstop: number;
  stunRemaining: number;
  grounded: boolean;
  guarding: boolean;
}
