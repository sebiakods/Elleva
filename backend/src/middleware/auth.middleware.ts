import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

/**
 * Shape of the decoded JWT payload, based on how your tokens are signed
 * (see the AUTH DEBUG log: sub, email, role, name, iat, exp).
 */
interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
  iat: number;
  exp: number;
}

// Augment Express's Request type so req.user is typed everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_SECRET) {
  // Fail fast at boot rather than silently accepting unverifiable tokens.
  throw new Error('JWT_SECRET is not set in environment variables');
}

/**
 * Verifies the Bearer token on the Authorization header and populates
 * req.user. Responds 401 if the header is missing/malformed or the token
 * is invalid/expired.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed Authorization header' });
  }

const token = authHeader.slice('Bearer '.length).trim();


console.log("AUTH HEADER:", authHeader);
console.log("TOKEN USED:", token);


try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    return next();
  } catch (error) {
  console.error("JWT VERIFY ERROR:", error);

  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      message: error.message, // e.g. "invalid signature", "jwt malformed"
    });
  }

  return res.status(401).json({
    message: "Invalid token",
  });
}
}

export default authenticate;
export function authorize(...roles: Role[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
}