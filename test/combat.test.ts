import { describe, expect, it } from "vitest";
import { GINGER_TABBY_CAT, GRAY_RABBIT, NOODLE_NIBBLES, PICKLES_PUGILIST } from "../src/core/frameData";

describe("four-fighter combat readability", () => {
  it("keeps each active fighter's frame data aligned to a readable archetype", () => {
    expect(GRAY_RABBIT.jumpVelocity).toBeLessThan(GINGER_TABBY_CAT.jumpVelocity);
    expect(GRAY_RABBIT.moves.lightKick.pushback).toBeGreaterThan(GINGER_TABBY_CAT.moves.lightKick.pushback);

    expect(GINGER_TABBY_CAT.moves.light.duration).toBeLessThan(GRAY_RABBIT.moves.light.duration);
    expect(GINGER_TABBY_CAT.moves.special.damage).toBeGreaterThan(GRAY_RABBIT.moves.special.damage);

    expect(PICKLES_PUGILIST.walkSpeed).toBeLessThan(GRAY_RABBIT.walkSpeed);
    expect(PICKLES_PUGILIST.moves.special.blockstun).toBeGreaterThan(GINGER_TABBY_CAT.moves.special.blockstun);
    expect(PICKLES_PUGILIST.moves.heavy.hitVolumes[0]?.rect.width).toBeLessThan(
      NOODLE_NIBBLES.moves.heavy.hitVolumes[0]?.rect.width,
    );

    expect(NOODLE_NIBBLES.walkSpeed).toBeGreaterThan(GINGER_TABBY_CAT.walkSpeed);
    expect(NOODLE_NIBBLES.moves.special.damage).toBeLessThan(PICKLES_PUGILIST.moves.special.damage);
    expect(NOODLE_NIBBLES.moves.special.hitVolumes[0]?.rect.width).toBeGreaterThan(
      GINGER_TABBY_CAT.moves.special.hitVolumes[0]?.rect.width,
    );
    expect(NOODLE_NIBBLES.moves.lightKick.blockstun).toBeGreaterThan(GINGER_TABBY_CAT.moves.lightKick.blockstun);
    expect(NOODLE_NIBBLES.moves.lightKick.pushback).toBeGreaterThan(GRAY_RABBIT.moves.lightKick.pushback);
  });
});
