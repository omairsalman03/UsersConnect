import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import logger from "../config/logger";

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isAllowedOrigin(origin: string, request: Request): boolean
{
    if (config.cors.enabled && config.cors.allowedOrigins.includes(origin))
        return true;
    
    try
    {
        return new URL(origin).host === request.get('host');
    }
    catch
    {
        // Not a valid URL, e.g. the literal "null"
        return false;
    }
}

export function originCheck(request: Request, response: Response, next: NextFunction)
{
    if (SAFE_METHODS.has(request.method))
        return next();

    const origin = request.headers.origin;
    if (!origin)
        return next();

    if (isAllowedOrigin(origin, request))
        return next();

    logger.warn(`Blocked cross-site ${request.method} ${request.path} from origin ${origin}`);
    return response.status(403).json({ message: "Forbidden: cross-site request blocked" });
}