import { config } from './config';
import { logger } from './lib';
import { buildApp } from './app';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({
      port: config.app.port,
      host: config.app.host,
    });

    logger.info(`🚀 ${config.app.name} started`);
    logger.info(`📍 Server running at http://${config.app.host}:${config.app.port}`);
    logger.info(`📚 Swagger UI at http://${config.app.host}:${config.app.port}/docs`);
    logger.info(`🏥 Health check at http://${config.app.host}:${config.app.port}/health`);
    logger.info(`🌍 Environment: ${config.app.env}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Server failed to start: ${errorMessage}`,
      error instanceof Error ? { error } : undefined,
    );
    process.exit(1);
  }
}

main();
