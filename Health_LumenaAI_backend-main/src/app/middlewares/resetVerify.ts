import { NextFunction, Request, Response } from "express";

import config from "../../config";
import { Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelpers";
import prisma from "../lib/prisma";
import { UserStatus } from "@prisma/client";


const resetVerifyToken = (...roles: string[]) => {
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
        throw new ApiError(httpStatus.UNAUTHORIZED, "reset verify token needed");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.otpSecret.reset_password_secret as Secret
      );

      const existingUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!existingUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
      }


      if (existingUser.status === UserStatus.DELETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This user is deleted ! ");
      }

      if (existingUser.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }
      // if (existingUser.status === UserStatus.DELETED) {
      //   throw new ApiError(httpStatus.BAD_REQUEST, 'Your account is not activated yet!');
      // }
      // if (existingUser.status === UserStatus.PENDING) {
      //   throw new ApiError(httpStatus.BAD_REQUEST, 'Your account is not accepted yet!');
      // }


      req.user = verifiedUser;
      if (roles.length && !roles.includes(verifiedUser.role)) {
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

export default resetVerifyToken;
