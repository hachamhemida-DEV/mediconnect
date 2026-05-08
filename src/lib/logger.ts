/**
 * Minimal structured logger.
 *
 * - In **production** (`NODE_ENV=production`): emits single-line JSON
 *   records on stdout, one per log call, with ISO timestamp, level,
 *   optional request-id, message, and arbitrary context fields.
 *   Designed for ingestion by datadog / loki / cloudwatch / stdout-only
 *   platforms without extra config.
 *
 * - In **development**: emits human-readable lines with ANSI colour so a
 *   terminal is pleasant to watch.
 *
 * Use `logger.with({ requestId })` at the top of each route handler to
 * get a child logger that automatically tags every line with the
 * correlation id produced by `middleware.ts`.
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const envLevel: Level = (process.env.LOG_LEVEL as Level) ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const threshold = LEVEL_ORDER[envLevel];

const ANSI = {
  reset: '\x1b[0m',
  dim:   '\x1b[2m',
  gray:  '\x1b[90m',
  red:   '\x1b[31m',
  green: '\x1b[32m',
  yel:   '\x1b[33m',
  blue:  '\x1b[34m',
  bold:  '\x1b[1m',
};

const COLOUR: Record<Level, string> = {
  debug: ANSI.gray,
  info:  ANSI.blue,
  warn:  ANSI.yel,
  error: ANSI.red,
};

export type LogContext = Record<string, unknown>;

class Logger {
  constructor(private ctx: LogContext = {}) {}

  /** Create a child logger with additional permanent context fields. */
  with(extra: LogContext): Logger {
    return new Logger({ ...this.ctx, ...extra });
  }

  debug(msg: string, extra?: LogContext) { this.write('debug', msg, extra); }
  info (msg: string, extra?: LogContext) { this.write('info',  msg, extra); }
  warn (msg: string, extra?: LogContext) { this.write('warn',  msg, extra); }
  error(msg: string, extra?: LogContext) { this.write('error', msg, extra); }

  private write(level: Level, msg: string, extra?: LogContext) {
    if (LEVEL_ORDER[level] < threshold) return;

    const record = {
      ts:    new Date().toISOString(),
      level,
      msg,
      ...this.ctx,
      ...(extra ?? {}),
    };

    if (process.env.NODE_ENV === 'production') {
      // Single-line JSON for log aggregators.
      process.stdout.write(JSON.stringify(record) + '\n');
      return;
    }

    // Pretty dev output.
    const requestId = (record as { requestId?: string }).requestId;
    const tag = requestId ? `${ANSI.gray}[${requestId.slice(0, 8)}]${ANSI.reset} ` : '';
    const lvl = `${COLOUR[level]}${level.padEnd(5)}${ANSI.reset}`;
    const rest = { ...record } as Record<string, unknown>;
    delete rest.ts; delete rest.level; delete rest.msg; delete rest.requestId;
    const extras = Object.keys(rest).length ? ` ${ANSI.dim}${JSON.stringify(rest)}${ANSI.reset}` : '';
    process.stdout.write(`${ANSI.gray}${record.ts}${ANSI.reset} ${lvl} ${tag}${msg}${extras}\n`);
  }
}

export const logger = new Logger();
