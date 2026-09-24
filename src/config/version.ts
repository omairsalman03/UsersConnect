import { readFileSync } from 'fs';
import { join } from 'path';
import logger from './logger';

function readVersion(): string | null
{
    try
    {
        const raw = readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8');
        const pkg = JSON.parse(raw) as { version?: unknown };
        return typeof pkg.version === 'string' ? pkg.version : null;
    }
    catch(err)
    {
        logger.warn('Could not read version from package.json; update check disabled', err);
        return null;
    }
}

export const APP_VERSION = readVersion();