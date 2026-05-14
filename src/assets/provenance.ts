export type ProvenanceStatus = "planned" | "blocked" | "generated" | "approved";
export type AssetMedium = "image" | "audio";
export type AssetSourceKind = "codex-imagegen" | "elevenlabs-sound-generation" | "pixabay" | "procedural" | "manual";
export type AssetLicenseKind =
  | "pending"
  | "owned-generated"
  | "procedural-owned"
  | "external-license-required";

export interface AssetLicense {
  kind: AssetLicenseKind;
  summary: string;
  sourceUrl: string | null;
  attribution: string | null;
  checkedOn: string | null;
}

export interface AssetProvenance {
  assetId: string;
  medium: AssetMedium;
  status: ProvenanceStatus;
  sourceKind: AssetSourceKind;
  provider: string;
  promptSlug: string;
  prompt: string;
  sourcePath: string | null;
  runtimePath: string | null;
  license: AssetLicense;
  createdOrDownloadedOn: string | null;
  transforms: readonly string[];
  approvalNotes: string;
  blocker: string | null;
}

export interface ProvenanceValidationResult {
  ok: boolean;
  errors: readonly string[];
}

export function plannedLicense(summary: string): AssetLicense {
  return {
    kind: "pending",
    summary,
    sourceUrl: null,
    attribution: null,
    checkedOn: null,
  };
}

export function validateProvenanceEntries(entries: readonly AssetProvenance[]): ProvenanceValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const entry of entries) {
    if (!entry.assetId.trim()) errors.push("assetId is required");
    if (ids.has(entry.assetId)) errors.push(`${entry.assetId}: duplicate assetId`);
    ids.add(entry.assetId);
    if (!entry.promptSlug.trim()) errors.push(`${entry.assetId}: promptSlug is required`);
    if (!entry.prompt.trim()) errors.push(`${entry.assetId}: prompt is required`);
    if (entry.status === "approved" && !entry.runtimePath) {
      errors.push(`${entry.assetId}: approved assets require runtimePath`);
    }
    if ((entry.status === "generated" || entry.status === "approved") && !entry.sourcePath) {
      errors.push(`${entry.assetId}: generated or approved assets require sourcePath`);
    }
    if ((entry.status === "planned" || entry.status === "blocked") && !entry.blocker) {
      errors.push(`${entry.assetId}: planned or blocked assets require blocker`);
    }
    if (entry.sourceKind === "pixabay" && entry.license.kind !== "external-license-required") {
      errors.push(`${entry.assetId}: Pixabay assets require explicit external license review`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function approvedAssetIds(entries: readonly AssetProvenance[]): readonly string[] {
  return entries.filter((entry) => entry.status === "approved").map((entry) => entry.assetId);
}
