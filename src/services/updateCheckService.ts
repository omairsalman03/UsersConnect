import { config } from '../config';
import logger from '../config/logger';
import { APP_VERSION } from '../config/version';

export interface UpdateNotice {
  id: string;
  title: string;
  body: string;
  url: string | null;
}

export interface UpdateInfo {
  latest: string;
  updateAvailable: boolean;
  url: string;
  notice: UpdateNotice | null;
  checkedAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const FIRST_CHECK_DELAY_MS = 30 * 1000;

// The latest successful answer, or null if we haven't got one yet.
let current: UpdateInfo | null = null;

export function getUpdateInfo(): UpdateInfo | null {
  return current;
}

function isHttpsUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('https://');
}

function parseNotice(value: unknown): UpdateNotice | null {
  if (value === null || typeof value !== 'object') return null;

  const { id, title, body, url } = value as Record<string, unknown>;

  if (typeof id !== 'string' || typeof title !== 'string' || typeof body !== 'string') return null;
  if (title.length > 100 || body.length > 500) return null;

  let noticeUrl: string | null = null;
  if (url !== undefined && url !== null) {
    if (!isHttpsUrl(url)) return null;
    noticeUrl = url;
  }

  return { id, title, body, url: noticeUrl };
}

async function checkForUpdates(): Promise<void> {
  if (!APP_VERSION) return;

  const requestUrl = new URL('/v1/check', config.updateCheck.endpoint);
  requestUrl.searchParams.set('product', 'api');
  requestUrl.searchParams.set('version', APP_VERSION);

  try {
    const res = await fetch(requestUrl, {
      headers: { 'User-Agent': `UsersConnect/${APP_VERSION}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      logger.warn(`Update check: service responded ${res.status}`);
      return;
    }

    const { latest, updateAvailable, url, notice } = (await res.json()) as Record<string, unknown>;

    if (typeof latest !== 'string' || typeof updateAvailable !== 'boolean' || !isHttpsUrl(url)) {
      logger.warn('Update check: unexpected response shape');
      return;
    }

    const parsedNotice = parseNotice(notice);

    current = { latest, updateAvailable, url, notice: parsedNotice, checkedAt: new Date() };

    logger.info(
      `Update check: running ${APP_VERSION}, latest is ${latest}` +
      (updateAvailable ? ' (update available)' : '') +
      (parsedNotice ? `, notice "${parsedNotice.id}"` : '')
    );
  } catch (err) {
    logger.warn('Update check failed:', err);
  }
}

export function startUpdateCheck(): void {
  if (!config.updateCheck.enabled || !APP_VERSION) return;

  setTimeout(() => {
    void checkForUpdates();
    setInterval(() => void checkForUpdates(), DAY_MS).unref();
  }, FIRST_CHECK_DELAY_MS).unref();
}