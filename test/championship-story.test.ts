import { describe, expect, it } from "vitest";
import { petFighterGameBible } from "../src/content";

describe("championship story polish", () => {
  const runtimeFighters = petFighterGameBible.runtimeFighterIds.map((runtimeFighterId) => {
    const fighter = petFighterGameBible.fighters.find((candidate) => candidate.id === runtimeFighterId);
    if (!fighter) throw new Error(`Missing runtime fighter ${runtimeFighterId}`);
    return fighter;
  });

  it("gives every runtime fighter a complete championship beat set", () => {
    for (const fighter of runtimeFighters) {
      expect(fighter.championship.rivalIntro.length).toBeGreaterThan(40);
      expect(fighter.championship.advancePayoff.length).toBeGreaterThan(40);
      expect(fighter.championship.titleClaim.length).toBeGreaterThan(40);
      expect(fighter.championship.runEnd.length).toBeGreaterThan(40);
    }
  });

  it("keeps active championship beats distinct and tied to fighter motives", () => {
    const allBeats = runtimeFighters.flatMap((fighter) => Object.values(fighter.championship));

    expect(new Set(allBeats).size).toBe(allBeats.length);
    expect(allBeats.join(" ")).toContain("cardboard");
    expect(allBeats.join(" ")).toContain("couch");
    expect(allBeats.join(" ")).toContain("edible");
    expect(allBeats.join(" ")).toContain("sock");
  });
});
