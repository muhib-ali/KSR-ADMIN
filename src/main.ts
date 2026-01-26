import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { runMigrations } from "./utils/run-migrations";
import { runSeeds } from "./utils/run-seeds";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Run migrations before starting the app
  try {
    logger.log("Running database migrations...");
    await runMigrations();
  } catch (error) {
    logger.error("Failed to run migrations. Application will not start.", error);
    process.exit(1);
  }

  // Run seeds after migrations (only in production or when RUN_SEEDS=true)
  const shouldRunSeeds = process.env.RUN_SEEDS === "true" || process.env.NODE_ENV === "production";
  if (shouldRunSeeds) {
    try {
      logger.log("Running database seeds...");
      await runSeeds();
    } catch (error) {
      logger.error("Failed to run seeds. Application will not start.", error);
      process.exit(1);
    }
  } else {
    logger.log("Skipping database seeds (set RUN_SEEDS=true to enable)");
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Ksr-Admin API")
    .setDescription(
      "NestJS backend with JWT authentication and role management"
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .addTag("Authentication", "User authentication endpoints")
    .addTag("Roles", "Role management endpoints")
    .addTag("Health", "Health check endpoints")
    .addTag("Blogs", "Blog management endpoints - CRUD operations for blog posts")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🏥 Health check: http://localhost:${port}/health`);
}
bootstrap();
