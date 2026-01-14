import { format } from 'node:util';

type Severity = 'ERROR' | 'NORMAL';

const logJsonl = (severity: Severity, message: string, ...args: unknown[]) => {
  const msg = format(message, ...args);
  const jsonl = JSON.stringify({ severity, message: msg });

  switch (severity) {
    case 'ERROR': {
      console.error(jsonl);
      break;
    }
    case 'NORMAL': {
      console.log(jsonl);
      break;
    }
  }
};

/**
 * Implements structured logging in JSONL as it's required to be done by
 * AdGuard infra team.
 */
export const logger = {
  info: (message?: unknown, ...args: unknown[]) => {
    logJsonl('NORMAL', String(message ?? ''), ...args);
  },
  error: (message?: unknown, ...args: unknown[]) => {
    logJsonl('ERROR', String(message ?? ''), ...args);
  },
};
