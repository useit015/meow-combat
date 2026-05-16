import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildSourceRosterLab,
  renderSourceRosterLabHtml,
  sourceRosterLabReviewCriteria,
} from "../src/assets/sourceRosterLab";

describe("Pawbreaker source roster lab", () => {
  it("separates playable runtime fighters from source-only planned identity locks", () => {
    const lab = buildSourceRosterLab();

    expect(lab.title).toBe("Pawbreaker League Source Roster Lab");
    expect(lab.summary.totalFighters).toBe(8);
    expect(lab.runtimeRoster.map((fighter) => fighter.id)).toEqual(["gray-rabbit", "ginger-tabby-cat", "pugilist-pug"]);
    expect(lab.runtimeRoster.every((fighter) => fighter.playable)).toBe(true);

    expect(lab.sourceOnlyIdentityLocks.map((fighter) => fighter.id)).toEqual([
      "ferret-noodle",
      "tortoise-tofu",
      "budgie-beanie",
      "hamster-mochi",
      "hedgehog-quillabelle",
    ]);
    for (const fighter of lab.sourceOnlyIdentityLocks) {
      expect(fighter.playable).toBe(false);
      expect(fighter.runtimeExposure).toBe("not playable");
      expect(fighter.reviewStatus).toBe("source-only identity lock");
      expect(fighter.canonicalSheetPath).toBe(`assets/source/imagegen/fighters/${fighter.id}/canonical-character-sheet.png`);
      expect(fighter.publicRuntimePath).toBeNull();
      expect(existsSync(join(process.cwd(), fighter.canonicalSheetPath ?? ""))).toBe(true);
      expect(existsSync(join(process.cwd(), `public/assets/generated/fighters/${fighter.id}`))).toBe(false);
    }
  });

  it("marks ungenerated planned fighters as missing identity locks", () => {
    const lab = buildSourceRosterLab();

    expect(lab.missingIdentityLocks).toEqual([]);
    expect(lab.summary.sourceOnlyIdentityLocks).toBe(5);
    expect(lab.summary.missingIdentityLocks).toBe(0);
  });

  it("keeps no-slop criteria focused on roster cohesion before runtime promotion", () => {
    const criteriaText = sourceRosterLabReviewCriteria.join(" ");

    expect(criteriaText).toContain("silhouette variety");
    expect(criteriaText).toContain("species readability");
    expect(criteriaText).toContain("palette spread");
    expect(criteriaText).toContain("stance readability");
    expect(criteriaText).toContain("proportion consistency");
    expect(criteriaText).toContain("copied marks");
    expect(criteriaText).toContain("text, logos, or watermarks");
  });

  it("keeps tracked roster-lab artifacts aligned with Pickles runtime promotion", () => {
    const lab = buildSourceRosterLab();
    const html = renderSourceRosterLabHtml(lab);
    const outputJson = JSON.parse(
      readFileSync(join(process.cwd(), "output/roster-lab/aaa-expansion-full-source-roster-lab.json"), "utf8"),
    );
    const partialOutputJson = JSON.parse(
      readFileSync(join(process.cwd(), "output/roster-lab/aaa-expansion-source-roster-lab.json"), "utf8"),
    );
    const outputHtml = readFileSync(
      join(process.cwd(), "output/roster-lab/aaa-expansion-full-source-roster-lab.html"),
      "utf8",
    );

    expect(outputJson.summary).toEqual({
      totalFighters: 8,
      playableRuntimeFighters: 3,
      sourceOnlyIdentityLocks: 5,
      missingIdentityLocks: 0,
      fullOutcome: "incomplete",
    });
    expect(outputJson.runtimeRoster.map((fighter: { id: string }) => fighter.id)).toEqual([
      "gray-rabbit",
      "ginger-tabby-cat",
      "pugilist-pug",
    ]);
    expect(outputJson.sourceOnlyIdentityLocks.map((fighter: { id: string }) => fighter.id)).not.toContain("pugilist-pug");
    expect(partialOutputJson.runtimeRoster.map((fighter: { id: string }) => fighter.id)).toContain("pugilist-pug");
    expect(partialOutputJson.sourceOnlyIdentityLocks.map((fighter: { id: string }) => fighter.id)).not.toContain(
      "pugilist-pug",
    );
    expect(html).toContain("Pickles Pugilist");
    expect(html).toContain("playable-runtime");
    expect(html).toContain("Noodle Nibbles");
    expect(html).toContain("Tofu Tortoise");
    expect(html).toContain("Beanie Beak");
    expect(html).toContain("Mochi Munch");
    expect(html).toContain("Quillabelle Prickles");
    expect(html).toContain("source-only");
    expect(html).toContain("not playable");
    expect(html).toContain("/assets/generated/fighters/pugilist-pug");
    expect(html).not.toContain("/assets/generated/fighters/ferret-noodle");
    expect(html).not.toContain("/assets/generated/fighters/tortoise-tofu");
    expect(html).not.toContain("/assets/generated/fighters/budgie-beanie");
    expect(html).not.toContain("/assets/generated/fighters/hamster-mochi");
    expect(html).not.toContain("/assets/generated/fighters/hedgehog-quillabelle");
    expect(outputHtml).toContain("/assets/generated/fighters/pugilist-pug");
    expect(outputHtml).not.toContain(
      "<tr><td>Pickles Pugilist</td><td>source-only identity lock</td><td>not playable</td>",
    );
    expect(outputHtml).not.toContain(
      "<tr><td>Pickles Pugilist</td><td>pug</td><td>source-only identity lock</td><td>not playable</td>",
    );
  });
});
