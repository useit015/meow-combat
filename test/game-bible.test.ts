import { describe, expect, it } from "vitest";
import { petFighterGameBible } from "../src/content";

const blockedReferenceTerms = ["pokemon", "kof", "king of fighters", "mortal kombat", "kombat", "street fighter"];

describe("pet fighter game bible", () => {
  it("defines an original IP-safe working title and production pillars", () => {
    expect(petFighterGameBible.workingTitle).toBe("Pawbreaker League");
    expect(petFighterGameBible.ipSafety.inspirationOnlyReferences).toEqual([
      "team-based arcade fighting pacing",
      "expressive one-on-one martial arts readability",
      "theatrical impact and over-the-top finish energy",
      "cute collectible pet appeal",
    ]);
    expect(petFighterGameBible.ipSafety.forbiddenDirectBorrowing).toContain("No copied character names.");

    const searchableText = [
      petFighterGameBible.workingTitle,
      petFighterGameBible.championship.name,
      petFighterGameBible.championship.firstStoryBeat,
      ...petFighterGameBible.fighters.flatMap((fighter) => [fighter.name, fighter.signatureMove, fighter.superMove]),
    ]
      .join(" ")
      .toLowerCase();

    for (const term of blockedReferenceTerms) {
      expect(searchableText).not.toContain(term);
    }
  });

  it("plans eight original pet fighters with Pickles promoted into the runtime roster", () => {
    expect(petFighterGameBible.fighters).toHaveLength(8);

    const ids = new Set(petFighterGameBible.fighters.map((fighter) => fighter.id));
    const names = new Set(petFighterGameBible.fighters.map((fighter) => fighter.name));

    expect(ids.size).toBe(8);
    expect(names.size).toBe(8);
    expect(petFighterGameBible.runtimeFighterIds).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(petFighterGameBible.fighters.filter((fighter) => fighter.runtime.status === "active")).toHaveLength(3);
    expect(petFighterGameBible.fighters.filter((fighter) => fighter.runtime.status === "planned")).toHaveLength(5);
  });

  it("keeps championship-facing copy aligned with all runtime fighters", () => {
    for (const runtimeFighterId of petFighterGameBible.runtimeFighterIds) {
      const fighter = petFighterGameBible.fighters.find((candidate) => candidate.id === runtimeFighterId);
      expect(fighter?.storyHook).toBeTruthy();
      expect(fighter?.trainingTip).toBeTruthy();
      expect(petFighterGameBible.championship.firstStoryBeat).toContain(fighter?.name);
    }
  });

  it("locks keyboard-first browser v1, landscape layout, and touch-mobile v2", () => {
    expect(petFighterGameBible.platformPlan.browserV1.controls).toBe("keyboard-first");
    expect(petFighterGameBible.platformPlan.browserV1.orientation).toBe("landscape");
    expect(petFighterGameBible.platformPlan.mobileV2.controls).toBe("touch");
    expect(petFighterGameBible.platformPlan.browserV1.nonGoals).toContain("Do not let touch/mobile expansion block browser v1 quality.");
  });

  it("requires authored or sample-based audio as primary and procedural audio as dev fallback only", () => {
    expect(petFighterGameBible.audio.primaryDirection).toBe("authored-sample-based");
    expect(petFighterGameBible.audio.proceduralFallback).toBe("dev-only");
    expect(petFighterGameBible.audio.allowedSources).toContain("Pixabay SFX/music with source records and Content ID risk notes.");
    expect(petFighterGameBible.audio.disallowed).toContain("ElevenLabs Music for commercial game music without written approval.");
  });

  it("captures no-slop model-sheet and animation acceptance rules", () => {
    expect(petFighterGameBible.visualProduction.modelSheetRequiredBeforeAnimation).toBe(true);
    expect(petFighterGameBible.visualProduction.animationAcceptance).toContain(
      "No character size drift between animation frames.",
    );
    expect(petFighterGameBible.visualProduction.animationAcceptance).toContain(
      "No identity drift in markings, face shape, proportions, costume details, or silhouette.",
    );
    expect(petFighterGameBible.visualProduction.rejectionReasons).toContain("generic AI-looking output");
  });

  it("tracks implemented and planned modes without overclaiming the rest", () => {
    expect(petFighterGameBible.modes.map((mode) => mode.id)).toEqual([
      "versus-cpu",
      "training",
      "championship",
      "local-versus",
      "roster-lab",
    ]);
    const championship = petFighterGameBible.modes.find((mode) => mode.id === "championship");
    expect(championship?.status).toBe("implemented");
    expect(championship?.purpose).toContain("Three-fighter story ladder");
    const localVersus = petFighterGameBible.modes.find((mode) => mode.id === "local-versus");
    expect(localVersus?.status).toBe("implemented");
    expect(localVersus?.purpose).toContain("Same-keyboard");
    expect(petFighterGameBible.modes.find((mode) => mode.id === "training")?.purpose).toContain(
      "input/combo practice feedback",
    );
    expect(petFighterGameBible.championship.firstStoryBeat).toContain("2026");
  });
});
