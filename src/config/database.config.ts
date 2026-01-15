import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: "public",
  synchronize: false,
  // ssl: process.env.DB_SSL === "true",
  ssl:
    process.env.DB_SSL === "true"
      ? {
        rejectUnauthorized: false,
      }
      : false,
  entities: [
    __dirname + "/../entities/*.entity{.ts,.js}",
    // __dirname + "/../../KSR-CUSTOMER/src/entities/*.entity{.ts,.js}"
  ],
  migrations: ["migrations/*{.ts,.js}"],
};

// Separate configuration for app runtime (without migrations)
export const appDataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: "public",
  synchronize: false,
  // ssl: process.env.DB_SSL === "true",  
  ssl:
    process.env.DB_SSL === "true"
      ? {
        rejectUnauthorized: false,
      }
      : false,
  entities: [
    __dirname + "/../entities/*.entity{.ts,.js}"
    // __dirname + "/../../KSR-CUSTOMER/src/entities/*.entity{.ts,.js}"
  ],
};

export default new DataSource(dataSourceOptions);
