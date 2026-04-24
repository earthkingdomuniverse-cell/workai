import { config } from './config';
import { loadOSSPlugins } from './open_source';
import { logger } from './lib';
import { buildApp } from './app';

async function main() {
  const app = await buildApp();
  // Initialize Open Source plugins if any
  try {
    const plugins = await loadOSSPlugins();
    for (const p of plugins) {
      if (typeof p.init === 'function') {
        // Pass the Fastify instance to plugin init for registration
        await p.init(app);
      }
    }
  } catch (e) {
    // Non-fatal: OSS plugin loading should not block server startup
    console.error('OSS plugin loading error', e);
  }

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
