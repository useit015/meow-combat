import { petFighterGameBible, type PlannedFighter } from "../content/gameBible";
import { meowtalKombatConfig } from "../game/gameConfig";
import { meowtalFighterAssetManifests, pawbreakerPlannedFighterAssetManifests } from "./catalog";

export type SourceRosterReviewStatus = "playable-runtime" | "source-only identity lock" | "missing identity lock";
export type SourceRosterRuntimeExposure = "playable" | "not playable";

export interface SourceRosterLabEntry {
  id: string;
  displayName: string;
  species: string;
  archetype: string;
  moveLanguage: string;
  runtimeExposure: SourceRosterRuntimeExposure;
  reviewStatus: SourceRosterReviewStatus;
  playable: boolean;
  sourceOnly: boolean;
  engineFighterId: string | null;
  canonicalSheetPath: string | null;
  publicRuntimePath: string | null;
  notes: readonly string[];
}

export interface SourceRosterLabSummary {
  totalFighters: number;
  playableRuntimeFighters: number;
  sourceOnlyIdentityLocks: number;
  missingIdentityLocks: number;
  fullOutcome: "incomplete";
}

export interface SourceRosterLab {
  title: "Pawbreaker League Source Roster Lab";
  purpose: string;
  rosterDirection: "8-fighter";
  runtimeRoster: readonly SourceRosterLabEntry[];
  sourceOnlyIdentityLocks: readonly SourceRosterLabEntry[];
  missingIdentityLocks: readonly SourceRosterLabEntry[];
  fighters: readonly SourceRosterLabEntry[];
  reviewCriteria: readonly string[];
  summary: SourceRosterLabSummary;
}

export const sourceRosterLabReviewCriteria = [
  "silhouette variety across the 8-fighter roster",
  "species readability before any animation or select-screen promotion",
  "palette spread that avoids a one-note roster wall",
  "stance readability for each fighter archetype",
  "proportion consistency between views and future frame rows",
  "reject copied marks, copied costume language, or reference-game symbols",
  "reject text, logos, or watermarks in source model sheets",
] as const;

export function buildSourceRosterLab(): SourceRosterLab {
  const runtimeIds = new Set(meowtalKombatConfig.roster.map((fighter) => fighter.id));
  const manifestById = new Map(
    [...meowtalFighterAssetManifests, ...pawbreakerPlannedFighterAssetManifests].map((manifest) => [manifest.id, manifest]),
  );
  const fighters = petFighterGameBible.fighters.map((fighter) =>
    rosterLabEntry(fighter, runtimeIds.has(fighter.id), manifestById.get(fighter.id)?.canonicalReference.outputPath ?? null),
  );
  const runtimeRoster = fighters.filter((fighter) => fighter.reviewStatus === "playable-runtime");
  const sourceOnlyIdentityLocks = fighters.filter((fighter) => fighter.reviewStatus === "source-only identity lock");
  const missingIdentityLocks = fighters.filter((fighter) => fighter.reviewStatus === "missing identity lock");

  return {
    title: "Pawbreaker League Source Roster Lab",
    purpose:
      "Source-only roster review surface for comparing identity locks, missing model sheets, and no-slop criteria before any planned fighter becomes public, selectable, or playable.",
    rosterDirection: "8-fighter",
    runtimeRoster,
    sourceOnlyIdentityLocks,
    missingIdentityLocks,
    fighters,
    reviewCriteria: sourceRosterLabReviewCriteria,
    summary: {
      totalFighters: fighters.length,
      playableRuntimeFighters: runtimeRoster.length,
      sourceOnlyIdentityLocks: sourceOnlyIdentityLocks.length,
      missingIdentityLocks: missingIdentityLocks.length,
      fullOutcome: "incomplete",
    },
  };
}

export function renderSourceRosterLabHtml(lab: SourceRosterLab = buildSourceRosterLab()): string {
  const rows = lab.fighters
    .map(
      (fighter) => `<tr>
        <td>${escapeHtml(fighter.displayName)}</td>
        <td>${escapeHtml(fighter.species)}</td>
        <td>${escapeHtml(fighter.reviewStatus)}</td>
        <td>${escapeHtml(fighter.runtimeExposure)}</td>
        <td>${escapeHtml(fighter.publicRuntimePath ?? fighter.canonicalSheetPath ?? "missing identity lock")}</td>
      </tr>`,
    )
    .join("\n");
  const criteria = lab.reviewCriteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(lab.title)}</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f6f2ea; color: #181512; }
    main { max-width: 1120px; margin: 0 auto; padding: 32px; }
    h1 { font-size: 32px; margin: 0 0 8px; }
    p { line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; background: #fffaf2; border: 1px solid #d8c7a7; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e7dac3; text-align: left; vertical-align: top; }
    th { background: #2c2f31; color: #fff; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin: 20px 0; }
    .pill { border: 1px solid #cdb990; background: #fff; padding: 8px 10px; font-weight: 700; }
  </style>
</head>
<body>
<main>
  <h1>${escapeHtml(lab.title)}</h1>
  <p>${escapeHtml(lab.purpose)}</p>
  <div class="summary">
    <div class="pill">${lab.summary.totalFighters} total / ${escapeHtml(lab.rosterDirection)}</div>
    <div class="pill">${lab.summary.playableRuntimeFighters} playable runtime fighters</div>
    <div class="pill">${lab.summary.sourceOnlyIdentityLocks} source-only identity locks</div>
    <div class="pill">${lab.summary.missingIdentityLocks} missing identity lock</div>
    <div class="pill">Full outcome: ${escapeHtml(lab.summary.fullOutcome)}</div>
  </div>
  <table>
    <thead>
      <tr><th>Fighter</th><th>Species</th><th>Review status</th><th>Runtime exposure</th><th>Source sheet</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <h2>No-Slop Review Criteria</h2>
  <ul>${criteria}</ul>
</main>
</body>
</html>`;
}

function rosterLabEntry(
  fighter: PlannedFighter,
  isRuntimePlayable: boolean,
  canonicalSheetPath: string | null,
): SourceRosterLabEntry {
  const reviewStatus: SourceRosterReviewStatus = isRuntimePlayable
    ? "playable-runtime"
    : canonicalSheetPath
      ? "source-only identity lock"
      : "missing identity lock";

  return {
    id: fighter.id,
    displayName: fighter.name,
    species: fighter.species,
    archetype: fighter.archetype,
    moveLanguage: fighter.moveLanguage,
    runtimeExposure: isRuntimePlayable ? "playable" : "not playable",
    reviewStatus,
    playable: isRuntimePlayable,
    sourceOnly: reviewStatus === "source-only identity lock",
    engineFighterId: isRuntimePlayable ? fighter.runtime.engineFighterId : null,
    canonicalSheetPath,
    publicRuntimePath: isRuntimePlayable ? `/assets/generated/fighters/${fighter.id}` : null,
    notes: reviewNotes(reviewStatus),
  };
}

function reviewNotes(reviewStatus: SourceRosterReviewStatus): readonly string[] {
  if (reviewStatus === "playable-runtime") {
    return ["Playable runtime fighter; already outside the planned source-only queue."];
  }
  if (reviewStatus === "source-only identity lock") {
    return ["source-only model sheet exists", "not playable", "no public/runtime asset path"];
  }
  return ["missing identity lock", "not playable", "requires model sheet before animation rows"];
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
