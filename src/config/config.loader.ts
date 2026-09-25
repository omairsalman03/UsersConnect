import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AppConfig } from './types/config.types';
import defaultConfig from './default.config';

// NOTE: Do NOT import from './index' here — that would create a circular dependency.
// Do NOT import the winston logger here — logger.ts is initialized after config is loaded.
// Use console.log/warn/error for all messages during config loading.

/**
 * Recursively merges `source` into `target`.
 * Plain objects are merged deeply; all other values (strings, numbers, arrays) are replaced.
 * `source` values take precedence over `target` values.
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source as object)) {
    const sourceVal = (source as Record<string, unknown>)[key];
    const targetVal = result[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      // Both sides are plain objects — recurse
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      );
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }

  return result as T;
}

/**
 * Loads and validates application configuration.
 *
 * Priority (lowest → highest):
 *   1. Default values  (`src/config/default.config.ts`)
 *   2. `config.yaml`   (optional file in the project root)
 *   3. Environment variables (always win)
 *
 * Required fields (missing → process exits with code 1):
 *   database.host, database.username, database.password, database.name,
 *   redis.host, jwt.accessTokenSecret, jwt.refreshTokenSecret
 *
 * Optional features are validated with warnings:
 *   S3 (image uploads), SMTP (transactional email)
 */
export function loadConfig(): AppConfig {
  // ── Step 1: Start from defaults ───────────────────────────────────────────
  let merged = { ...defaultConfig } as Partial<AppConfig>;

  // ── Step 2: Merge config.yaml if it exists ────────────────────────────────
  const yamlPath = path.join(process.cwd(), 'config.yaml');

  if (fs.existsSync(yamlPath)) {
    try {
      const rawYaml = fs.readFileSync(yamlPath, 'utf8');
      const yamlConfig = yaml.load(rawYaml) as Partial<AppConfig>;

      if (yamlConfig && typeof yamlConfig === 'object') {
        merged = deepMerge(merged, yamlConfig);
        console.log('[config] Loaded configuration from config.yaml');
      }
    } catch (err) {
      console.error('[config] Failed to parse config.yaml — using defaults and env vars only:', err);
    }
  } else {
    console.log('[config] No config.yaml found — using defaults and environment variables');
  }

  // ── Step 3: Apply environment variable overrides ──────────────────────────
  // Only override when the env var is present AND non-empty (avoids stomping YAML values).

  // app
  if (!merged.app) merged.app = { nodeEnv: 'production' };
  if (process.env.NODE_ENV) merged.app.nodeEnv = process.env.NODE_ENV as AppConfig['app']['nodeEnv'];

  // database
  if (!merged.database) merged.database = { host: '', username: '', password: '', name: '', connectionRetries: 10, retryDelay: 5000 };
  if (process.env.DATABASE_HOST) merged.database.host = process.env.DATABASE_HOST;
  if (process.env.DATABASE_USERNAME) merged.database.username = process.env.DATABASE_USERNAME;
  if (process.env.DATABASE_PASSWORD) merged.database.password = process.env.DATABASE_PASSWORD;
  if (process.env.DATABASE_NAME) merged.database.name = process.env.DATABASE_NAME;

  // redis
  if (!merged.redis) merged.redis = { host: '', ttl: (defaultConfig.redis as AppConfig['redis']).ttl };
  if (process.env.REDIS_HOST) merged.redis.host = process.env.REDIS_HOST;
  if (process.env.REDIS_PASSWORD) merged.redis.password = process.env.REDIS_PASSWORD;

  // jwt
  if (!merged.jwt) merged.jwt = { accessTokenSecret: '', refreshTokenSecret: '', accessTokenExpiry: '15m', refreshTokenExpiry: '30d' };
  if (process.env.ACCESS_TOKEN_SECRET) merged.jwt.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  if (process.env.REFRESH_TOKEN_SECRET) merged.jwt.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  // gravatar
  if (!merged.gravatar) merged.gravatar = {};
  if (process.env.GRAVATAR_API_KEY) merged.gravatar.apiKey = process.env.GRAVATAR_API_KEY;

  // s3
  if (!merged.s3) merged.s3 = {};
  if (process.env.S3_ENDPOINT) merged.s3.endpoint = process.env.S3_ENDPOINT;
  if (process.env.S3_ACCESS_KEY) merged.s3.accessKey = process.env.S3_ACCESS_KEY;
  if (process.env.S3_SECRET_KEY) merged.s3.secretKey = process.env.S3_SECRET_KEY;
  if (process.env.S3_BUCKET_NAME) merged.s3.bucketName = process.env.S3_BUCKET_NAME;
  if (process.env.S3_REGION) merged.s3.region = process.env.S3_REGION;
  if (process.env.S3_PUBLIC_URL) merged.s3.publicUrl = process.env.S3_PUBLIC_URL;

  // smtp
  if (!merged.smtp) merged.smtp = { from: { name: 'UsersConnect' } };
  if (!merged.smtp.from) merged.smtp.from = { name: 'UsersConnect' };
  if (process.env.SMTP_HOST) merged.smtp.host = process.env.SMTP_HOST;
  if (process.env.SMTP_PORT) merged.smtp.port = Number(process.env.SMTP_PORT);
  if (process.env.SMTP_SECURE) merged.smtp.secure = process.env.SMTP_SECURE === 'true';
  if (process.env.SMTP_USER) merged.smtp.user = process.env.SMTP_USER;
  if (process.env.SMTP_PASSWORD) merged.smtp.password = process.env.SMTP_PASSWORD;
  if (process.env.SMTP_FROM_NAME) merged.smtp.from.name = process.env.SMTP_FROM_NAME;
  if (process.env.SMTP_FROM_EMAIL) merged.smtp.from.email = process.env.SMTP_FROM_EMAIL;

  // cors
  if (!merged.cors) merged.cors = { enabled: false, allowedOrigins: [], allowCredentials: true, allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Accept'] };
  if (process.env.CORS_ENABLED !== undefined) merged.cors.enabled = process.env.CORS_ENABLED === 'true';
  if (process.env.CORS_ALLOWED_ORIGINS) merged.cors.allowedOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(o => o.length > 0);
  if (process.env.CORS_ALLOW_CREDENTIALS !== undefined) merged.cors.allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === 'true';
  if (process.env.CORS_ALLOWED_METHODS) merged.cors.allowedMethods = process.env.CORS_ALLOWED_METHODS.split(',').map(m => m.trim()).filter(m => m.length > 0);
  if (process.env.CORS_ALLOWED_HEADERS) merged.cors.allowedHeaders = process.env.CORS_ALLOWED_HEADERS.split(',').map(h => h.trim()).filter(h => h.length > 0);

  // logging
  if (!merged.logging) merged.logging = { level: 'info', directory: '/logs', maxFileSize: 10485760, maxFiles: 5 };
  if (process.env.LOG_LEVEL) merged.logging.level = process.env.LOG_LEVEL as AppConfig['logging']['level'];

  // update check
  if (!merged.updateCheck) merged.updateCheck = { ...(defaultConfig.updateCheck as AppConfig['updateCheck']) };
  if (process.env.UPDATE_CHECK_ENABLED !== undefined) merged.updateCheck.enabled = process.env.UPDATE_CHECK_ENABLED === 'true';
  if (process.env.UPDATE_CHECK_ENDPOINT) merged.updateCheck.endpoint = process.env.UPDATE_CHECK_ENDPOINT;

  // ── Step 4: Validate required fields ─────────────────────────────────────
  const missing: string[] = [];

  if (!merged.database?.host) missing.push('database.host (DATABASE_HOST)');
  if (!merged.database?.username) missing.push('database.username (DATABASE_USERNAME)');
  if (!merged.database?.password) missing.push('database.password (DATABASE_PASSWORD)');
  if (!merged.database?.name) missing.push('database.name (DATABASE_NAME)');
  if (!merged.redis?.host) missing.push('redis.host (REDIS_HOST)');
  if (!merged.jwt?.accessTokenSecret) missing.push('jwt.accessTokenSecret (ACCESS_TOKEN_SECRET)');
  if (!merged.jwt?.refreshTokenSecret) missing.push('jwt.refreshTokenSecret (REFRESH_TOKEN_SECRET)');

  if (missing.length > 0) {
    console.error('[config] Missing required configuration fields:');
    for (const field of missing) {
      console.error(`  - ${field}`);
    }
    console.error('[config] Set these via environment variables or config.yaml. Exiting.');
    // Skip process.exit in test environment — Jest workers mock dependencies anyway.
    // JEST_WORKER_ID is set by Jest in all worker processes.
    if (!process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }

  // ── Step 5: Warn about missing optional features ──────────────────────────
  const s3 = merged.s3;
  if (!s3?.accessKey || !s3?.secretKey || !s3?.bucketName) {
    console.warn('[config] S3 is not configured — image uploads will be disabled');
  }

  const smtp = merged.smtp;
  if (!smtp?.host || !smtp?.user || !smtp?.password) {
    console.warn('[config] SMTP is not configured — transactional email will be disabled');
  }

  console.log('[config] Configuration loaded successfully');

  if (merged.updateCheck.enabled) {
    console.log(`[config] Update check enabled — once a day, sends product and version to ${merged.updateCheck.endpoint} (disable with UPDATE_CHECK_ENABLED=false)`);
  } else {
    console.log('[config] Update check disabled');
  }

  return merged as AppConfig;
}
