import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DEFAULT_SCORING_RULES = [
  { statCategory: "passingTD", pointValue: 4 },
  { statCategory: "passingYards", pointValue: 0.04 },
  { statCategory: "passingINT", pointValue: -2 },
  { statCategory: "rushingTD", pointValue: 6 },
  { statCategory: "rushingYards", pointValue: 0.1 },
  { statCategory: "receivingTD", pointValue: 6 },
  { statCategory: "receivingYards", pointValue: 0.1 },
  { statCategory: "receptions", pointValue: 0 },
  { statCategory: "fumblesLost", pointValue: -2 },
  { statCategory: "fg0to39", pointValue: 3 },
  { statCategory: "fg40to49", pointValue: 4 },
  { statCategory: "fg50plus", pointValue: 5 },
  { statCategory: "patMade", pointValue: 1 },
  { statCategory: "patMissed", pointValue: -1 },
  { statCategory: "defSack", pointValue: 1 },
  { statCategory: "defINT", pointValue: 2 },
  { statCategory: "defFumbleRecovery", pointValue: 2 },
  { statCategory: "defTD", pointValue: 6 },
  { statCategory: "defSafety", pointValue: 2 },
  { statCategory: "defPointsAllowed0", pointValue: 10 },
  { statCategory: "defPointsAllowed1to6", pointValue: 7 },
  { statCategory: "defPointsAllowed7to13", pointValue: 4 },
  { statCategory: "defPointsAllowed14to20", pointValue: 1 },
  { statCategory: "defPointsAllowed21to27", pointValue: 0 },
  { statCategory: "defPointsAllowed28plus", pointValue: -4 },
];

export const DEFAULT_ROSTER_SLOTS = [
  { position: "QB" as const, count: 1 },
  { position: "RB" as const, count: 2 },
  { position: "WR" as const, count: 2 },
  { position: "TE" as const, count: 1 },
  { position: "FLEX" as const, count: 1 },
  { position: "K" as const, count: 1 },
  { position: "DEF" as const, count: 1 },
  { position: "BENCH" as const, count: 6 },
];

async function main() {
  console.log("Seed complete — no global seed data needed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
