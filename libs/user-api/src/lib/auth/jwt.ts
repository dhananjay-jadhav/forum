import { env, logger } from '@app/utils';
import jwt, { JwtPayload, SignOptions, VerifyOptions } from 'jsonwebtoken';

// ============================================================================
// JWT Types
// ============================================================================

/**
 * JWT claims structure for user authentication
 */
export interface JwtUserClaims extends JwtPayload {
    /** User ID */
    user_id: number;
    /** Username */
    username: string;
    /** Token type: access or refresh */
    type: 'access' | 'refresh';
}

/**
 * JWT token response returned after login/register
 */
export interface JwtTokenResponse {
    /** Access token for API authentication */
    accessToken: string;
    /** Refresh token for getting new access tokens */
    refreshToken: string;
    /** Access token expiration time in seconds */
    expiresIn: number;
}

// ============================================================================
// JWT Configuration
// ============================================================================

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes in seconds

const DEFAULT_SIGN_OPTIONS: SignOptions = {
    algorithm: 'HS256',
    issuer: 'forum-api',
    audience: 'forum-app',
};

const DEFAULT_VERIFY_OPTIONS: VerifyOptions = {
    algorithms: ['HS256'],
    issuer: 'forum-api',
    audience: 'forum-app',
};

// ============================================================================
// JWT Utility Functions
// ============================================================================

/**
 * Gets the JWT secret from environment.
 * Throws an error if not configured in production.
 */
export function getJwtSecret(): string {
    const secret = env.JWT_SECRET;
    
    if (!secret && env.isProduction) {
        throw new Error('JWT_SECRET is required in production');
    }
    
    // Use a default secret for development/testing
    return secret || 'development-secret-do-not-use-in-production';
}

/**
 * Generates an access token for a user
 */
export function generateAccessToken(userId: number, username: string): string {
    const payload: Omit<JwtUserClaims, 'iat' | 'exp'> = {
        user_id: userId,
        username,
        type: 'access',
    };

    return jwt.sign(payload, getJwtSecret(), {
        ...DEFAULT_SIGN_OPTIONS,
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
}

/**
 * Generates a refresh token for a user
 */
export function generateRefreshToken(userId: number, username: string): string {
    const payload: Omit<JwtUserClaims, 'iat' | 'exp'> = {
        user_id: userId,
        username,
        type: 'refresh',
    };

    return jwt.sign(payload, getJwtSecret(), {
        ...DEFAULT_SIGN_OPTIONS,
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });
}

/**
 * Generates both access and refresh tokens for a user
 */
export function generateTokens(userId: number, username: string): JwtTokenResponse {
    return {
        accessToken: generateAccessToken(userId, username),
        refreshToken: generateRefreshToken(userId, username),
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
}

/**
 * Verifies a JWT token and returns the claims
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtUserClaims {
    try {
        const decoded = jwt.verify(token, getJwtSecret(), DEFAULT_VERIFY_OPTIONS) as JwtUserClaims;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            logger.debug({ error }, 'Token expired');
            throw new Error('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            logger.debug({ error }, 'Invalid token');
            throw new Error('Invalid token');
        }
        throw error;
    }
}

/**
 * Verifies an access token and returns the claims
 * @throws Error if token is invalid, expired, or not an access token
 */
export function verifyAccessToken(token: string): JwtUserClaims {
    const claims = verifyToken(token);
    
    if (claims.type !== 'access') {
        throw new Error('Invalid token type: expected access token');
    }
    
    return claims;
}

/**
 * Verifies a refresh token and returns the claims
 * @throws Error if token is invalid, expired, or not a refresh token
 */
export function verifyRefreshToken(token: string): JwtUserClaims {
    const claims = verifyToken(token);
    
    if (claims.type !== 'refresh') {
        throw new Error('Invalid token type: expected refresh token');
    }
    
    return claims;
}

/**
 * Extracts the bearer token from an Authorization header
 * @returns The token string or null if not found/invalid format
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }
    
    return parts[1];
}

/**
 * Decodes a JWT without verifying it (useful for debugging)
 * WARNING: This does not validate the token!
 */
export function decodeToken(token: string): JwtUserClaims | null {
    const decoded = jwt.decode(token) as JwtUserClaims | null;
    return decoded;
}
