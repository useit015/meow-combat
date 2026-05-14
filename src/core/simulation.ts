import { clamp, rectsOverlap, worldRect } from "./geometry";
import { InputBuffer, createInput } from "./input";
import { ATLAS_LION, SAHARA_VIPER } from "./frameData";
import type {
  CommandId,
  CombatEvent,
  ComboState,
  FighterDefinition,
  FighterRuntime,
  FighterSnapshot,
  FighterState,
  InputSnapshot,
  MatchRuntime,
  MatchSnapshot,
  MobilityCommandId,
  MoveDefinition,
  PlayerId,
} from "./types";

const GRAVITY = 0.78;
const DEFAULT_ROUND_SECONDS = 99;
const STAGE_BOUNDS = { x: 64, y: 0, width: 896, height: 540 };
const DEFAULT_GROUND_Y = 462;
const COMBO_TIMEOUT_FRAMES = 90;
const BACKDASH_FRAMES = 18;
const ROLL_FRAMES = 25;
const RUN_MAX_FRAMES = 44;
const KNOCKDOWN_FRAMES = 60;
export const POWER_METER_STOCK = 1000;
export const POWER_METER_MAX = POWER_METER_STOCK * 3;

interface RuntimeInternals {
  buffers: Record<PlayerId, InputBuffer>;
}

export class FightingSimulation {
  private match: MatchRuntime;
  private readonly internals: RuntimeInternals;
  private readonly roundSeconds: number;
  private readonly p1Definition: FighterDefinition;
  private readonly p2Definition: FighterDefinition;

  constructor(options: { roundSeconds?: number; p1Definition?: FighterDefinition; p2Definition?: FighterDefinition } = {}) {
    this.roundSeconds = options.roundSeconds ?? DEFAULT_ROUND_SECONDS;
    this.p1Definition = options.p1Definition ?? ATLAS_LION;
    this.p2Definition = options.p2Definition ?? SAHARA_VIPER;
    this.match = createInitialMatch(this.roundSeconds, this.p1Definition, this.p2Definition);
    this.internals = {
      buffers: {
        p1: new InputBuffer(),
        p2: new InputBuffer(),
      },
    };
  }

  reset(): void {
    this.match = createInitialMatch(this.roundSeconds, this.p1Definition, this.p2Definition);
    this.internals.buffers.p1 = new InputBuffer();
    this.internals.buffers.p2 = new InputBuffer();
  }

  step(inputs: Partial<Record<PlayerId, InputSnapshot>> = {}): MatchSnapshot {
    if (this.match.status === "round-over") {
      return this.snapshot();
    }

    const frame = this.match.frame + 1;
    const p1Input = inputs.p1 ?? createInput(frame);
    const p2Input = inputs.p2 ?? createInput(frame);
    this.internals.buffers.p1.push({ ...p1Input, frame });
    this.internals.buffers.p2.push({ ...p2Input, frame });

    const events: CombatEvent[] = [];
    this.faceOpponents();
    this.tickFighter("p1", this.match.p1, this.match.p2, this.internals.buffers.p1, frame, events);
    this.tickFighter("p2", this.match.p2, this.match.p1, this.internals.buffers.p2, frame, events);
    this.resolveAttacks(this.match.p1, this.match.p2, frame, events);
    this.resolveAttacks(this.match.p2, this.match.p1, frame, events);
    this.separateFighters();
    this.match.combo = expireCombo(this.match.combo, frame);

    const roundTimer = Math.max(0, this.roundSeconds - Math.floor(frame / 60));
    const outcome = resolveOutcome(this.match.p1, this.match.p2, roundTimer);

    this.match = {
      ...this.match,
      frame,
      roundTimer,
      status: outcome.status,
      winner: outcome.winner,
      events,
    };
    return this.snapshot();
  }

  snapshot(): MatchSnapshot {
    return {
      frame: this.match.frame,
      roundTimer: this.match.roundTimer,
      status: this.match.status,
      winner: this.match.winner,
      combo: this.match.combo,
      p1: fighterSnapshot(this.match.p1),
      p2: fighterSnapshot(this.match.p2),
      events: this.match.events,
    };
  }

  activeHitboxes(player: PlayerId) {
    const fighter = this.match[player];
    const move = activeMove(fighter);
    if (!move) return [];
    return move.hitVolumes
      .filter((volume) => fighter.stateFrame >= volume.frameStart && fighter.stateFrame <= volume.frameEnd)
      .map((volume) => worldRect(volume.rect, fighter.x, fighter.y, fighter.facing));
  }

  hurtbox(player: PlayerId) {
    const fighter = this.match[player];
    return worldRect(fighter.definition.hurtbox, fighter.x, fighter.y, fighter.facing);
  }

  private faceOpponents(): void {
    this.match.p1.facing = this.match.p1.x <= this.match.p2.x ? 1 : -1;
    this.match.p2.facing = this.match.p2.x < this.match.p1.x ? 1 : -1;
  }

  private tickFighter(
    id: PlayerId,
    fighter: FighterRuntime,
    opponent: FighterRuntime,
    buffer: InputBuffer,
    frame: number,
    events: CombatEvent[],
  ): void {
    if (fighter.hitstop > 0) {
      fighter.hitstop -= 1;
      return;
    }

    fighter.stateFrame += 1;

    if (fighter.state === "hitstun" || fighter.state === "blockstun" || fighter.state === "knockdown") {
      fighter.stunRemaining = Math.max(0, fighter.stunRemaining - 1);
      if (fighter.stunRemaining <= 0) {
        setState(fighter, "idle", frame, events);
      }
      applyGravity(fighter, this.match.groundY);
      return;
    }

    const move = activeMove(fighter);
    if (move) {
      const cancelCommand = buffer.consumeCommand(fighter.facing, {
        allowNormals: false,
        canSuper: fighter.meter >= POWER_METER_STOCK,
      });
      if (cancelCommand && canCancelInto(move, cancelCommand, fighter.stateFrame)) {
        executeAttackCommand(fighter, cancelCommand, frame, events);
        return;
      }

      if (fighter.stateFrame > move.duration) {
        setState(fighter, "idle", frame, events);
      }
      applyGravity(fighter, this.match.groundY);
      return;
    }

    const command = buffer.consumeCommand(fighter.facing, { canSuper: fighter.meter >= POWER_METER_STOCK });
    if (command) {
      executeAttackCommand(fighter, command, frame, events);
      return;
    }

    if (fighter.grounded) {
      const mobilityCommand = buffer.consumeMobilityCommand(fighter.facing);
      if (mobilityCommand) {
        executeMobilityCommand(fighter, mobilityCommand, frame, events);
        applyMobilityState(fighter, buffer, opponent, frame, events, this.match.groundY);
        return;
      }
    }

    if (applyMobilityState(fighter, buffer, opponent, frame, events, this.match.groundY)) {
      return;
    }

    const latest = buffer.latest();
    if (latest.buttons.jump && fighter.grounded) {
      const isHop = latest.horizontal !== 0;
      setState(fighter, isHop ? "hop" : "jump", frame, events);
      fighter.velocityY = isHop ? fighter.definition.jumpVelocity * 0.68 : fighter.definition.jumpVelocity;
      fighter.grounded = false;
    } else if (latest.buttons.crouch || latest.vertical === 1) {
      setState(fighter, "crouch", frame, events);
    } else {
      const direction = buffer.directionForLatest(fighter.facing);
      if (direction === "forward") {
        setState(fighter, "walkForward", frame, events);
        fighter.x += fighter.definition.walkSpeed * fighter.facing;
      } else if (direction === "back") {
        setState(fighter, "walkBack", frame, events);
        fighter.x -= fighter.definition.walkSpeed * fighter.facing;
      } else if (fighter.grounded) {
        setState(fighter, "idle", frame, events);
      }
    }

    if (fighter.state === "jump" || fighter.state === "hop") {
      fighter.x += latest.horizontal * fighter.definition.walkSpeed * (fighter.state === "hop" ? 0.95 : 0.72);
    }

    fighter.x = clamp(fighter.x, this.match.bounds.x, this.match.bounds.x + this.match.bounds.width);
    applyGravity(fighter, this.match.groundY);
    keepInCombatRange(fighter, opponent);
    void id;
  }

  private resolveAttacks(
    attacker: FighterRuntime,
    defender: FighterRuntime,
    frame: number,
    events: CombatEvent[],
  ): void {
    const move = activeMove(attacker);
    if (!move || attacker.lastHitFrame === frame || isStrikeInvulnerable(defender)) return;

    const activeVolumes = move.hitVolumes.filter(
      (volume) => attacker.stateFrame >= volume.frameStart && attacker.stateFrame <= volume.frameEnd,
    );
    if (activeVolumes.length === 0) return;

    const defenderHurtbox = worldRect(defender.definition.hurtbox, defender.x, defender.y, defender.facing);
    const hasHit = activeVolumes.some((volume) =>
      rectsOverlap(worldRect(volume.rect, attacker.x, attacker.y, attacker.facing), defenderHurtbox),
    );
    if (!hasHit) return;

    attacker.lastHitFrame = frame;
    if (isBlocking(defender, attacker)) {
      defender.hitstop = move.defenderFreeze;
      attacker.hitstop = move.attackerFreeze;
      setState(defender, "blockstun", frame, events);
      defender.stunRemaining = move.blockstun;
      gainMeter(attacker, move.meterGainOnBlock);
      gainMeter(defender, Math.round(move.meterGainOnBlock * 1.45));
      push(defender, move.pushback * 0.55, attacker);
      events.push({
        type: "block",
        frame,
        attacker: attacker.id,
        defender: defender.id,
        move: move.id,
      });
      return;
    }

    defender.health = Math.max(0, defender.health - move.damage);
    this.match.combo = recordComboHit(this.match.combo, attacker.id, defender.id, move.damage, frame);
    defender.hitstop = move.defenderFreeze;
    attacker.hitstop = move.attackerFreeze;
    setState(defender, defender.health === 0 ? "knockdown" : "hitstun", frame, events);
    defender.stunRemaining = defender.health === 0 ? KNOCKDOWN_FRAMES : move.hitstun;
    gainMeter(attacker, move.meterGainOnHit);
    gainMeter(defender, Math.max(24, Math.round(move.damage * 0.42)));
    push(defender, move.pushback, attacker);
    events.push({
      type: "hit",
      frame,
      attacker: attacker.id,
      defender: defender.id,
      move: move.id,
      damage: move.damage,
    });
  }

  private separateFighters(): void {
    const minDistance = 56;
    const distance = this.match.p2.x - this.match.p1.x;
    if (Math.abs(distance) >= minDistance) return;

    const overlap = (minDistance - Math.abs(distance)) / 2;
    const direction = distance >= 0 ? 1 : -1;
    this.match.p1.x = clamp(this.match.p1.x - overlap * direction, this.match.bounds.x, this.match.bounds.x + this.match.bounds.width);
    this.match.p2.x = clamp(this.match.p2.x + overlap * direction, this.match.bounds.x, this.match.bounds.x + this.match.bounds.width);
  }
}

function createInitialMatch(
  roundSeconds: number,
  p1Definition: FighterDefinition,
  p2Definition: FighterDefinition,
): MatchRuntime {
  return {
    frame: 0,
    roundTimer: roundSeconds,
    status: "fighting",
    winner: null,
    combo: initialCombo(),
    groundY: DEFAULT_GROUND_Y,
    bounds: STAGE_BOUNDS,
    p1: createFighter("p1", p1Definition, 300, 1),
    p2: createFighter("p2", p2Definition, 724, -1),
    events: [],
  };
}

function initialCombo(): ComboState {
  return {
    attacker: null,
    defender: null,
    count: 0,
    damage: 0,
    lastHitFrame: null,
  };
}

function recordComboHit(
  combo: ComboState,
  attacker: PlayerId,
  defender: PlayerId,
  damage: number,
  frame: number,
): ComboState {
  const continues =
    combo.attacker === attacker &&
    combo.defender === defender &&
    combo.lastHitFrame !== null &&
    frame - combo.lastHitFrame <= COMBO_TIMEOUT_FRAMES;

  return {
    attacker,
    defender,
    count: continues ? combo.count + 1 : 1,
    damage: continues ? combo.damage + damage : damage,
    lastHitFrame: frame,
  };
}

function expireCombo(combo: ComboState, frame: number): ComboState {
  if (combo.lastHitFrame === null) return combo;
  return frame - combo.lastHitFrame > COMBO_TIMEOUT_FRAMES ? initialCombo() : combo;
}

function resolveOutcome(
  p1: FighterRuntime,
  p2: FighterRuntime,
  roundTimer: number,
): { status: "fighting"; winner: null } | { status: "round-over"; winner: PlayerId | "draw" } {
  if (p1.health <= 0 && p2.health <= 0) return { status: "round-over", winner: "draw" };
  if (p1.health <= 0) return { status: "round-over", winner: "p2" };
  if (p2.health <= 0) return { status: "round-over", winner: "p1" };
  if (roundTimer <= 0) {
    if (p1.health === p2.health) return { status: "round-over", winner: "draw" };
    return { status: "round-over", winner: p1.health > p2.health ? "p1" : "p2" };
  }
  return { status: "fighting", winner: null };
}

function createFighter(id: PlayerId, definition: FighterDefinition, x: number, facing: 1 | -1): FighterRuntime {
  return {
    id,
    definition,
    x,
    y: DEFAULT_GROUND_Y,
    velocityY: 0,
    facing,
    health: definition.maxHealth,
    meter: 0,
    state: "idle",
    stateFrame: 0,
    hitstop: 0,
    stunRemaining: 0,
    lastHitFrame: null,
    grounded: true,
  };
}

function executeAttackCommand(
  fighter: FighterRuntime,
  command: CommandId,
  frame: number,
  events: CombatEvent[],
): void {
  const move = fighter.definition.moves[command];
  if (command === "super") {
    fighter.meter = Math.max(0, fighter.meter - POWER_METER_STOCK);
  } else {
    gainMeter(fighter, move.meterGainOnUse);
  }

  setState(fighter, move.state, frame, events);
  fighter.lastHitFrame = null;
}

function executeMobilityCommand(
  fighter: FighterRuntime,
  command: MobilityCommandId,
  frame: number,
  events: CombatEvent[],
): void {
  setState(fighter, command, frame, events);
  fighter.lastHitFrame = null;
}

function applyMobilityState(
  fighter: FighterRuntime,
  buffer: InputBuffer,
  opponent: FighterRuntime,
  frame: number,
  events: CombatEvent[],
  groundY: number,
): boolean {
  if (fighter.state === "runForward") {
    fighter.x += fighter.definition.walkSpeed * 1.95 * fighter.facing;
    if (fighter.stateFrame > RUN_MAX_FRAMES || buffer.directionForLatest(fighter.facing) !== "forward") {
      setState(fighter, "idle", frame, events);
    }
    finalizeGroundMovement(fighter, opponent, groundY);
    return true;
  }

  if (fighter.state === "backdash") {
    fighter.x -= fighter.definition.walkSpeed * 2.25 * fighter.facing;
    if (fighter.stateFrame > BACKDASH_FRAMES) {
      setState(fighter, "idle", frame, events);
    }
    finalizeGroundMovement(fighter, opponent, groundY);
    return true;
  }

  if (fighter.state === "rollForward" || fighter.state === "rollBack") {
    const direction = fighter.state === "rollForward" ? fighter.facing : -fighter.facing;
    fighter.x += fighter.definition.walkSpeed * 1.7 * direction;
    if (fighter.stateFrame > ROLL_FRAMES) {
      setState(fighter, "idle", frame, events);
    }
    finalizeGroundMovement(fighter, opponent, groundY);
    return true;
  }

  return false;
}

function finalizeGroundMovement(fighter: FighterRuntime, opponent: FighterRuntime, groundY: number): void {
  fighter.x = clamp(fighter.x, STAGE_BOUNDS.x, STAGE_BOUNDS.x + STAGE_BOUNDS.width);
  applyGravity(fighter, groundY);
  keepInCombatRange(fighter, opponent);
}

function canCancelInto(move: MoveDefinition, command: CommandId, stateFrame: number): boolean {
  if (command !== "special" && command !== "super") return false;
  if (move.id === "special" || move.id === "super") return false;
  const firstActiveFrame = move.hitVolumes[0]?.frameStart ?? 6;
  return stateFrame >= firstActiveFrame && stateFrame <= move.duration - 3;
}

function gainMeter(fighter: FighterRuntime, amount: number): void {
  fighter.meter = clamp(fighter.meter + amount, 0, POWER_METER_MAX);
}

function setState(
  fighter: FighterRuntime,
  next: FighterState,
  frame: number,
  events: CombatEvent[],
): void {
  if (fighter.state === next) return;
  const previous = fighter.state;
  fighter.state = next;
  fighter.stateFrame = 0;
  if (next !== "hitstun" && next !== "blockstun" && next !== "knockdown") {
    fighter.stunRemaining = 0;
  }
  events.push({ type: "state", frame, fighter: fighter.id, from: previous, to: next });
}

function activeMove(fighter: FighterRuntime): MoveDefinition | null {
  return Object.values(fighter.definition.moves).find((move) => move.state === fighter.state) ?? null;
}

function isBlocking(defender: FighterRuntime, attacker: FighterRuntime): boolean {
  const facingAttacker = defender.facing === -attacker.facing;
  return facingAttacker && (defender.state === "walkBack" || defender.state === "crouch");
}

function isStrikeInvulnerable(defender: FighterRuntime): boolean {
  return defender.state === "rollForward" || defender.state === "rollBack" || defender.state === "backdash";
}

function push(defender: FighterRuntime, amount: number, attacker: FighterRuntime): void {
  defender.x += amount * attacker.facing;
}

function applyGravity(fighter: FighterRuntime, groundY: number): void {
  if (fighter.grounded && fighter.state !== "jump" && fighter.state !== "hop") return;
  fighter.velocityY += GRAVITY;
  fighter.y += fighter.velocityY;
  if (fighter.y >= groundY) {
    fighter.y = groundY;
    fighter.velocityY = 0;
    fighter.grounded = true;
    if (fighter.state === "jump" || fighter.state === "hop") {
      fighter.state = "idle";
      fighter.stateFrame = 0;
    }
  }
}

function keepInCombatRange(fighter: FighterRuntime, opponent: FighterRuntime): void {
  const maxDistance = 580;
  const distance = fighter.x - opponent.x;
  if (Math.abs(distance) > maxDistance) {
    fighter.x = opponent.x + Math.sign(distance) * maxDistance;
  }
}

function fighterSnapshot(fighter: FighterRuntime): FighterSnapshot {
  return {
    id: fighter.id,
    character: fighter.definition.displayName,
    x: Math.round(fighter.x * 100) / 100,
    y: Math.round(fighter.y * 100) / 100,
    facing: fighter.facing,
    health: fighter.health,
    meter: fighter.meter,
    state: fighter.state,
    stateFrame: fighter.stateFrame,
    hitstop: fighter.hitstop,
    stunRemaining: fighter.stunRemaining,
    grounded: fighter.grounded,
  };
}
