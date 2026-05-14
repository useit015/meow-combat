const hasKey = Boolean(process.env.OPENAI_API_KEY);

if (hasKey) {
  console.log("OPENAI_API_KEY=present");
  console.log("Ready to run prepared imagegen jobs for fighter references, animation rows, and stage layers.");
} else {
  console.log("OPENAI_API_KEY=missing");
  console.log("Set OPENAI_API_KEY locally before running imagegen asset generation.");
  console.log("Prepared jobs are defined in src/assets/imagegenJobs.ts.");
}
