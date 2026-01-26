import { seed } from "../seeders/seed";
import { Logger } from "@nestjs/common";

const logger = new Logger("SeedRunner");

export async function runSeeds(): Promise<void> {
  try {
    logger.log("Starting database seeding...");
    await seed();
    logger.log("✅ Database seeding completed successfully");
  } catch (error) {
    logger.error("❌ Error running seeds:", error);
    throw error;
  }
}

