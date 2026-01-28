import { logger } from '@app/utils';
import { NextFunction, Request, Response } from 'express';

import { extractBearerToken, JwtUserClaims, verifyAccessToken } from '../auth/index.js';

// Extend Express Request to include user info
declare module 'express-serve-static-core' {
    interface Request {
        user?: JwtUserClaims;
    }
}

/**
 * JWT authentication middleware.
 * 
 * Extracts and validates JWT from Authorization header.
 * If valid, attaches user claims to req.user.
 * If invalid, sets req.user to undefined (does not reject).
 * 
 * Use with protectedRoute middleware for routes that require authentication.
 */
export function jwtAuthentication(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);
    
    if (!token) {
        // No token provided - continue without user
        req.user = undefined;
        next();
        return;
    }
    
    try {
        const claims = verifyAccessToken(token);
        req.user = claims;
        logger.debug({ userId: claims.user_id, username: claims.username }, 'JWT authenticated');
    } catch (error) {
        // Invalid token - continue without user
        logger.debug({ error }, 'JWT authentication failed');
        req.user = undefined;
    }
    
    next();
}

/**
 * Protected route middleware.
 * 
 * Rejects the request with 401 if not authenticated.
 * Use after jwtAuthentication middleware.
 */
export function protectedRoute(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        });
        return;
    }
    
    next();
}

/**
 * Gets the PostgreSQL settings for JWT claims.
 * Used by PostGraphile pgSettings to pass JWT claims to the database.
 */
export function getJwtPgSettings(req: Request): Record<string, string> {
    const settings: Record<string, string> = {};
    
    if (req.user) {
        settings['jwt.claims.user_id'] = String(req.user.user_id);
        settings['jwt.claims.username'] = req.user.username;
    }
    
    return settings;
}
