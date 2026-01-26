import { DataSource } from "typeorm";
import { dataSourceOptions } from "../config/database.config";
import { Logger } from "@nestjs/common";

// Register ts-node for TypeScript migration support in production
try {
  require("ts-node/register");
} catch (e) {
  // ts-node not available, migrations must be compiled to JS
}

const logger = new Logger("MigrationRunner");

export async function runMigrations(): Promise<void> {
  const dataSource = new DataSource(dataSourceOptions);
  let isInitialized = false;

  try {
    logger.log("Initializing database connection for migrations...");
    await dataSource.initialize();
    isInitialized = true;
    logger.log("Database connection established");

    logger.log("Running pending migrations...");
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length > 0) {
      logger.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        logger.log(`   - ${migration.name}`);
      });
    } else {
      logger.log("✅ No pending migrations found");
    }

    logger.log("Migration process completed");
  } catch (error) {
    logger.error("❌ Error running migrations:", error);
    if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);
      if (error.stack) {
        logger.error(`Stack trace: ${error.stack}`);
      }
    }
    throw error;
  } finally {
    if (isInitialized) {
      try {
        await dataSource.destroy();
        logger.log("Database connection closed");
      } catch (destroyError) {
        logger.warn("Error closing database connection:", destroyError);
      }
    }
  }
}

