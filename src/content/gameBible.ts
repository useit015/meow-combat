export type PlannedFighterRuntimeStatus = "active" | "planned";
export type ModeStatus = "implemented" | "planned";

export interface PlannedFighter {
  id: string;
  name: string;
  species: string;
  personality: string;
  archetype: string;
  moveLanguage: string;
  signatureMove: string;
  superMove: string;
  storyHook: string;
  arenaTieIn: string;
  trainingTip: string;
  runtime: {
    status: PlannedFighterRuntimeStatus;
    engineFighterId: string | null;
  };
}

export interface GameBibleMode {
  id: "versus-cpu" | "training" | "championship" | "local-versus" | "roster-lab";
  label: string;
  status: ModeStatus;
  purpose: string;
}

export interface PetFighterGameBible {
  workingTitle: string;
  pitch: string;
  tone: string;
  runtimeFighterIds: readonly string[];
  platformPlan: {
    browserV1: {
      controls: "keyboard-first";
      orientation: "landscape";
      nonGoals: readonly string[];
    };
    mobileV2: {
      controls: "touch";
      orientation: "landscape";
    };
  };
  ipSafety: {
    inspirationOnlyReferences: readonly string[];
    forbiddenDirectBorrowing: readonly string[];
  };
  championship: {
    name: string;
    premise: string;
    firstStoryBeat: string;
  };
  fighters: readonly PlannedFighter[];
  modes: readonly GameBibleMode[];
  audio: {
    primaryDirection: "authored-sample-based";
    proceduralFallback: "dev-only";
    allowedSources: readonly string[];
    disallowed: readonly string[];
  };
  visualProduction: {
    modelSheetRequiredBeforeAnimation: true;
    animationAcceptance: readonly string[];
    rejectionReasons: readonly string[];
  };
}

export const petFighterGameBible: PetFighterGameBible = {
  workingTitle: "Pawbreaker League",
  pitch:
    "An original brutal-funny pet fighting championship where cute household heroes treat neighborhood drama like a world title fight.",
  tone: "Funny, theatrical, and crunchy, with stylized comic impact instead of realistic shock violence.",
  runtimeFighterIds: ["gray-rabbit", "ginger-tabby-cat", "pugilist-pug", "ferret-noodle"],
  platformPlan: {
    browserV1: {
      controls: "keyboard-first",
      orientation: "landscape",
      nonGoals: [
        "Do not let touch/mobile expansion block browser v1 quality.",
        "Do not ship unfinished roster slots as playable fighters.",
        "Do not generate final animation rows before a locked model sheet exists.",
      ],
    },
    mobileV2: {
      controls: "touch",
      orientation: "landscape",
    },
  },
  ipSafety: {
    inspirationOnlyReferences: [
      "team-based arcade fighting pacing",
      "expressive one-on-one martial arts readability",
      "theatrical impact and over-the-top finish energy",
      "cute collectible pet appeal",
    ],
    forbiddenDirectBorrowing: [
      "No copied character names.",
      "No copied logos, title marks, or announcer calls.",
      "No copied signature moves, finishing-move names, or UI compositions.",
      "No creature-capture, gym, fatality, or tournament-team structures that read as reference-game clones.",
    ],
  },
  championship: {
    name: "The Snackbelt Invitational",
    premise:
      "In normal 2026, a citywide pet wellness fair accidentally becomes a televised prize fight after every animal discovers the winner gets a lifetime treat dispenser and naming rights to the good couch.",
    firstStoryBeat:
      "In 2026, Bunjamin Thump, Marmalade Mayhem, Pickles Pugilist, and Noodle Nibbles crash the opening weigh-in after a delivery drone drops the championship treat belt into the courtyard and every pet declares legal ownership by licking it first.",
  },
  fighters: [
    {
      id: "gray-rabbit",
      name: "Bunjamin Thump",
      species: "gray rabbit",
      personality: "A polite little menace who bows before launching shin-level chaos.",
      archetype: "fast footwork trickster",
      moveLanguage: "spring-loaded hops, heel taps, ear feints, and dust-ring evasions",
      signatureMove: "Velvet Heel Check",
      superMove: "Full Moon Footnote",
      storyHook: "Wants the treat belt to fund a luxury cardboard castle with a strict no-cats door policy.",
      arenaTieIn: "Courtyard tiles become launch pads for his bouncing footwork.",
      trainingTip: "Use hops and light kicks to test spacing before committing to a heavy punish.",
      runtime: { status: "active", engineFighterId: "gray-rabbit" },
    },
    {
      id: "ginger-tabby-cat",
      name: "Marmalade Mayhem",
      species: "ginger tabby cat",
      personality: "A dramatic couch monarch who believes every combo deserves applause.",
      archetype: "rushdown swat boxer",
      moveLanguage: "paw flurries, tail whips, shoulder bumps, and sunbeam-powered bursts",
      signatureMove: "Curtain-Claw Combo",
      superMove: "Nine-Nap Knockout",
      storyHook: "Wants the belt because the prize couch is clearly already his and everyone else missed the memo.",
      arenaTieIn: "Uses warm light patches like personal stage marks.",
      trainingTip: "Stay close, chain quick swats, and spend meter when the opponent tries to hop away.",
      runtime: { status: "active", engineFighterId: "ginger-tabby-cat" },
    },
    {
      id: "pugilist-pug",
      name: "Pickles Pugilist",
      species: "pug",
      personality: "All heart, no brakes, and convinced breathing loudly counts as intimidation.",
      archetype: "stubby pressure boxer",
      moveLanguage: "short hooks, belly checks, stubborn armor, and wheezy fake-outs",
      signatureMove: "Snort-Step Uppercut",
      superMove: "Wrinkle Rumble Rush",
      storyHook: "Entered after hearing the trophy was edible, which nobody has successfully disproved.",
      arenaTieIn: "Needs low platforms and comic dust puffs to sell his tiny forward pressure.",
      trainingTip: "Walk opponents down with guard pressure and cash out when they panic jump.",
      runtime: { status: "active", engineFighterId: "pugilist-pug" },
    },
    {
      id: "ferret-noodle",
      name: "Noodle Nibbles",
      species: "ferret",
      personality: "A slippery sock thief who treats every arena like a hallway he owns.",
      archetype: "mix-up and side-switch specialist",
      moveLanguage: "slides, tunnel rolls, ankle nips, and sudden behind-you reversals",
      signatureMove: "Laundry Basket Lariat",
      superMove: "Sock Drawer Singularity",
      storyHook: "Needs the prize money to buy every sock in the neighborhood and hide them responsibly.",
      arenaTieIn: "Props and foreground clutter should emphasize sneaky entrances and exits.",
      trainingTip: "Use side switches to make guard direction and spacing feel unstable.",
      runtime: { status: "active", engineFighterId: "ferret-noodle" },
    },
    {
      id: "tortoise-tofu",
      name: "Tofu Tortoise",
      species: "tortoise",
      personality: "Calm, ancient, and willing to take seven seconds to deliver the funniest elbow drop possible.",
      archetype: "armored grappler",
      moveLanguage: "shell braces, slow command grabs, ground bumps, and patient counter-hits",
      signatureMove: "Shell Receipt",
      superMove: "Curbside Meteor Nap",
      storyHook: "Believes the championship belt is actually a travel pillow owed to him by law.",
      arenaTieIn: "Stage camera can lean into heavy landings and tiny crater jokes.",
      trainingTip: "Absorb one hit, get close, then punish impatient attacks with grabs.",
      runtime: { status: "planned", engineFighterId: null },
    },
    {
      id: "budgie-beanie",
      name: "Beanie Beak",
      species: "blue budgie",
      personality: "Tiny, flashy, and absolutely certain the crowd came for his theme song.",
      archetype: "aerial poke zoner",
      moveLanguage: "wing flicks, perch hops, feather darts, and rhythm-based dive kicks",
      signatureMove: "Perchline Pop",
      superMove: "Encore Featherstorm",
      storyHook: "Joins to force the league to replace all bells with better percussion.",
      arenaTieIn: "Needs overhead pose readability and clear shadow grounding.",
      trainingTip: "Control air space, then dive when the opponent overcommits.",
      runtime: { status: "planned", engineFighterId: null },
    },
    {
      id: "hamster-mochi",
      name: "Mochi Munch",
      species: "hamster",
      personality: "Round, cheerful, and carrying the emotional weight of every stolen snack.",
      archetype: "tiny burst grappler",
      moveLanguage: "cheek-puff charges, rolling tackles, crumb traps, and surprise throws",
      signatureMove: "Cheek Vault",
      superMove: "Midnight Snack Avalanche",
      storyHook: "Wants the treat dispenser because one bowl at a time is a human limitation.",
      arenaTieIn: "Foreground crumbs and scale jokes should make wins feel absurdly heroic.",
      trainingTip: "Bait whiffs with small size, then roll in for a throw or burst combo.",
      runtime: { status: "planned", engineFighterId: null },
    },
    {
      id: "hedgehog-quillabelle",
      name: "Quillabelle Prickles",
      species: "hedgehog",
      personality: "Elegant, suspicious, and always one rude comment away from becoming a cactus.",
      archetype: "counter-poke defender",
      moveLanguage: "quill parries, short lunges, prickly guard traps, and spinning retreats",
      signatureMove: "Needlepoint Notice",
      superMove: "Royal Pin Cushion",
      storyHook: "Demands the belt after the league misspells her name on the fancy invitation.",
      arenaTieIn: "Needs crisp outline contrast so quill reads stay funny instead of noisy.",
      trainingTip: "Hold space, punish reckless approaches, and use counters to start offense.",
      runtime: { status: "planned", engineFighterId: null },
    },
  ],
  modes: [
    {
      id: "versus-cpu",
      label: "1 VS CPU",
      status: "implemented",
      purpose: "Primary browser v1 fight mode for proving feel, HUD, round flow, and CPU pressure.",
    },
    {
      id: "training",
      label: "Training",
      status: "implemented",
      purpose: "Single-player lab for animation, hit feedback, input/combo practice feedback, and dummy behavior.",
    },
    {
      id: "championship",
      label: "Snackbelt Championship",
      status: "implemented",
      purpose: "Four-fighter story ladder with funny rival beats and controlled roster progression.",
    },
    {
      id: "local-versus",
      label: "Local Versus",
      status: "implemented",
      purpose: "Same-keyboard browser v1 PvP using the current four-fighter runtime roster and manual P1/P2 controls.",
    },
    {
      id: "roster-lab",
      label: "Roster Lab",
      status: "planned",
      purpose: "Internal content/QA surface for reviewing planned fighters before runtime promotion.",
    },
  ],
  audio: {
    primaryDirection: "authored-sample-based",
    proceduralFallback: "dev-only",
    allowedSources: [
      "Pixabay SFX/music with source records and Content ID risk notes.",
      "ElevenLabs sound effects or TTS only when plan terms and source records are verified.",
      "Locally authored loops, one-shots, stingers, and layered cue variants.",
    ],
    disallowed: [
      "ElevenLabs Music for commercial game music without written approval.",
      "Cloned real-person voices without explicit rights and consent workflow.",
      "Procedural synthesis as the primary shipped sound direction.",
    ],
  },
  visualProduction: {
    modelSheetRequiredBeforeAnimation: true,
    animationAcceptance: [
      "No character size drift between animation frames.",
      "No identity drift in markings, face shape, proportions, costume details, or silhouette.",
      "No warped limbs, melted features, flickering outlines, or detached baked effects.",
      "Every move needs readable anticipation, contact, impact pause, and recovery.",
      "Portraits should derive from approved identity-lock art when redraws risk drift.",
    ],
    rejectionReasons: [
      "generic AI-looking output",
      "copied reference-game costume, move, logo, title, or UI language",
      "unreadable silhouette",
      "runtime rows without matching source/provenance records",
      "animation rows generated before a locked model sheet",
    ],
  },
};
