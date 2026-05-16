export type PlannedFighterRuntimeStatus = "active" | "planned";
export type ModeStatus = "implemented" | "planned";

export interface FighterChampionshipStory {
  rivalIntro: string;
  advancePayoff: string;
  titleClaim: string;
  runEnd: string;
}

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
  championship: FighterChampionshipStory;
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
      championship: {
        rivalIntro:
          "Bunjamin enters with courtroom ears, insisting the cardboard castle deed is binding if the crowd stays quiet.",
        advancePayoff:
          "Bunjamin stamps the fallen rival with one dusty heel tap and asks whether the couch has zoning laws.",
        titleClaim:
          "Bunjamin dedicates the Snackbelt to every cardboard box that believed it could become real estate.",
        runEnd:
          "Bunjamin files a tiny complaint, calls the loss a procedural hop, and protects the cardboard castle anyway.",
      },
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
      championship: {
        rivalIntro:
          "Marmalade Mayhem pads in like the couch has hired him personally to remove all unworthy sitters.",
        advancePayoff:
          "Marmalade paws the scorecard flat, flicks couch fur at the camera, and accepts applause as rent.",
        titleClaim:
          "Marmalade claims the good couch by royal nap law and leaves the Snackbelt warm from dramatic posing.",
        runEnd:
          "Marmalade pretends the loss was an intermission, then demands the couch save his spot for revenge.",
      },
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
      championship: {
        rivalIntro:
          "Pickles waddles to center ring sniff-testing the edible trophy theory with absolute scientific confidence.",
        advancePayoff:
          "Pickles wheezes through the count, pockets the stamp, and asks if edible trophies come in bulk packs.",
        titleClaim:
          "Pickles declares the Snackbelt mostly edible, which is legally close enough for a champion pug.",
        runEnd:
          "Pickles loses the round but not the edible trophy hypothesis, which remains under urgent review.",
      },
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
      championship: {
        rivalIntro:
          "Noodle Nibbles appears from behind the bracket table with a sock ledger and several suspicious alibis.",
        advancePayoff:
          "Noodle coils around the stamp, marks one rival as folded, and allocates prize money to sock security.",
        titleClaim:
          "Noodle claims the Snackbelt, the sock budget, and three exits nobody noticed until the lights came up.",
        runEnd:
          "Noodle loses the run, denies all sock allegations, and vanishes with the consolation towel anyway.",
      },
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
      championship: {
        rivalIntro:
          "Tofu Tortoise arrives seven seconds late and still somehow makes the travel pillow argument feel final.",
        advancePayoff:
          "Tofu nods once, advances the bracket slowly, and lets the crater finish most of the speech.",
        titleClaim:
          "Tofu rests on the Snackbelt travel pillow and refuses to acknowledge any appeals filed before dinner.",
        runEnd:
          "Tofu accepts the loss peacefully, then waits for everyone else to age into admitting he was right.",
      },
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
      championship: {
        rivalIntro:
          "Beanie Beak lands on the rope, counts in the crowd, and demands the bell learn basic rhythm.",
        advancePayoff:
          "Beanie chirps the result on beat, signs the stamp mid-hop, and books himself for the encore.",
        titleClaim:
          "Beanie turns the Snackbelt ceremony into a tiny concert where every stamp hits the downbeat.",
        runEnd:
          "Beanie calls the loss a remix, blames the bell, and schedules a louder comeback.",
      },
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
      championship: {
        rivalIntro:
          "Mochi Munch rolls in with emergency cheeks loaded and a treat dispenser business plan.",
        advancePayoff:
          "Mochi converts one crumb into momentum, stamps the bracket, and calls it snack infrastructure.",
        titleClaim:
          "Mochi claims the Snackbelt dispenser for all tiny athletes who were told one bowl was enough.",
        runEnd:
          "Mochi drops the run, saves the crumbs, and quietly begins funding the rematch with pocket snacks.",
      },
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
      championship: {
        rivalIntro:
          "Quillabelle Prickles unfolds the misspelled invitation and lets every quill become a legal objection.",
        advancePayoff:
          "Quillabelle dots the bracket stamp with perfect posture and a warning about spelling standards.",
        titleClaim:
          "Quillabelle claims the Snackbelt, corrects the engraving, and makes the league apologize in cursive.",
        runEnd:
          "Quillabelle loses with dignity, keeps the invitation as evidence, and sharpens the rematch clause.",
      },
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
