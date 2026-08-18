/** Page-specific copy, lifted out so the page reads as composition rather than content. */
export const VALUES = [
  {
    icon: "chart",
    title: "Optimise for the reader",
    body: "The person reading the schedule outnumbers the person writing it ten to one. We build for the ten.",
  },
  {
    icon: "shield",
    title: "One version of the truth",
    body: "A plan that exists in three places is three plans. Tidewell holds exactly one.",
  },
  {
    icon: "bolt",
    title: "Ship weekly, say so",
    body: "A public changelog keeps us honest about pace in a way a roadmap never does.",
  },
  {
    icon: "layers",
    title: "Model the real structure",
    body: "Work nests and depends on other work. Flattening that to a list is where trust leaks out.",
  },
] as const;

export const TEAM = [
  {
    name: "Marta Voss",
    role: "Founder",
    bio: "Ran delivery for a fifty-person studio and kept the schedule in her head until it stopped fitting.",
  },
  {
    name: "Dele Akande",
    role: "Engineering",
    bio: "Builds the import pipeline. Believes a tool you cannot leave in an afternoon is a trap, not a product.",
  },
  {
    name: "Priya Shah",
    role: "Operations",
    bio: "Our first customer before joining. Still reads the schedule the way a customer does — out loud, on Mondays.",
  },
] as const;
