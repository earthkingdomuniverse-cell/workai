import pino, { Logger } from 'pino';
import { config, isDev } from '../config';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}

class LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = pino({
      level: config.app.logLevel,
      base: {
        env: config.app.env,
        app: config.app.name,
      },
      transport: isDev()
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              messageFormat: '{levelLabel} {msg}',
            },
          }
        : undefined,
    });
  }

  private getContext(context?: LogContext) {
    const ctx: Record<string, any> = {};

    if (context?.requestId) ctx.requestId = context.requestId;
    if (context?.correlationId) ctx.correlationId = context.correlationId;
    if (context?.userId) ctx.userId = context.userId;

    Object.keys(context || {}).forEach((key) => {
      if (!['requestId', 'correlationId', 'userId'].includes(key)) {
        ctx[key] = (context as any)[key];
      }
    });

    return Object.keys(ctx).length > 0 ? ctx : undefined;
  }

  debug(msg: string, context?: LogContext) {
    this.logger.debug(this.getContext(context), msg);
  }

  info(msg: string, context?: LogContext) {
    this.logger.info(this.getContext(context), msg);
  }

  warn(msg: string, context?: LogContext) {
    this.logger.warn(this.getContext(context), msg);
  }

  error(msg: string, context?: LogContext & { error?: Error }) {
    const { error, ...rest } = context || {};
    const err = error ? { err: error } : {};
    this.logger.error({ ...this.getContext(rest), ...err }, msg);
  }

  fatal(msg: string, context?: LogContext) {
    this.logger.fatal(this.getContext(context), msg);
  }

  child(bindings: Record<string, any>): Logger {
    return this.logger.child(bindings);
  }
}

export const logger = new LoggerService();
export default logger;
