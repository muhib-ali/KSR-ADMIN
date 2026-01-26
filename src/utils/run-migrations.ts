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

  try {
    logger.log("Initializing database connection for migrations...");
    await dataSource.initialize();
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

    await dataSource.destroy();
    logger.log("Migration process completed");
  } catch (error) {
    logger.error("❌ Error running migrations:", error);
    await dataSource.destroy();
    throw error;
  }
}

