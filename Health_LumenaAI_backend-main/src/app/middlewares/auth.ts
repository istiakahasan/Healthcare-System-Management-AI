import { NextFunction, Request, Response } from "express";

import config from "../../config";
import { Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelpers";
import prisma from "../lib/prisma";
import { UserStatus } from "@prisma/client";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const headersAuth = req.headers.authorization;
      if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization format!");
      }
      const token: string | undefined = headersAuth?.split(' ')[1]
      if (!token) {
        if (req.headers.accept === "text/event-stream") {
          res.writeHead(httpStatus.UNAUTHORIZED, {
            "Content-Type": "text/event-stream",
            Connection: "close",
          });
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "User not found!",
            })}\n\n`
          );
          res.end();
          return;
        }
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );

      const existingUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!existingUser) {
        if (req.headers.accept === "text/event-stream") {
          res.writeHead(httpStatus.UNAUTHORIZED, {
            "Content-Type": "text/event-stream",
            Connection: "close",
          });
          res.write(
            `event: error\ndata: ${JSON.stringify({
              message: "User not found!",
            })}\n\n`
          );
          res.end();
          return;
        }

        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
      }

      if (existingUser.status === UserStatus.DELETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This user is deleted ! ");
      };

      if (existingUser.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }
      req.user = existingUser;

      if (roles.length && !roles.includes(existingUser.role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden! You are not authorized"
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
