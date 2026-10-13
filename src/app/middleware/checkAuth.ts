import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cokiesUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";

/**
 * 
 * 1. Get sessionToken (cookie)
2. Check session in DB
3. Check user status
4. Check role (session)
5. Get accessToken
6. Verify JWT
7. Check role (JWT)
8. Allow request
 * 
 * 
 */

export const checkAuth =
  (...authRoles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Cookies:", req.cookies);
      console.log("Headers:", req.headers.cookie);

      const sessionToken = cokiesUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new Error("Unauthorized");
      }

      if (sessionToken) {
        const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;
          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);
          const sessionLifetime =
            (expiresAt.getTime() - createdAt.getTime()) / 1000; // in seconds
          const timeRemaining = (expiresAt.getTime() - now.getTime()) / 1000; // in seconds
          const percentRemaining = (timeRemaining / sessionLifetime) * 100;

          if (percentRemaining < 20) {
            // If less than 20% of the session lifetime is remaining, you can choose to refresh the session
            // For example, you could create a new session and set a new cookie
            // Or you could update the existing session's expiresAt to extend it
            // Here, we'll just log that the session is about to expire

            if (percentRemaining < 20) {
              res.setHeader("X-Session-Expiring", "true");
              res.setHeader("X- Session-Expires-At", expiresAt.toISOString());
              res.setHeader(
                "X-Session-Time-Remaining",
                timeRemaining.toString(),
              );
            }
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED ||
            user.isDeleted
          ) {
            throw new Error("Unauthorized");
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role as Role)) {
            throw new Error("Unauthorized");
          }

          req.user = {
            userId: user.id,
            role: user.role as Role,
            email: user.email,
          };
        }
        const acceessToken = cokiesUtils.getCookie(req, "accessToken");
        if (!acceessToken) {
          throw new Error("Unauthorized");
        }
      }

      const accessToken = cokiesUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const verifyToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifyToken) {
        throw new Error("Invalid access token");
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifyToken.data!.role as Role)
      ) {
        throw new Error("Unauthorized");
      }

      next();
    } catch (err: any) {
      next(err);
    }
  };
