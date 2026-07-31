import { NextFunction, Request, Response } from "express";
import config from "../../config";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status";

import { UserStatus } from "@prisma/client";
import ApiError from "../errors/ApiError";
import { jwtHelpers } from "../helpers/jwtHelpers";
import prisma from "../lib/prisma";

const verifyOtpToken = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      // const token = req.headers.authorization;
      const headersAuth = req.headers.authorization;
      const { reason } = req.body;
      if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization format!");
      }
      const token: string | undefined = headersAuth?.split(' ')[1]

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Verify token needed");
      }

      let secretKey: Secret | undefined;

      switch (reason) {
        case "SIGNUP_OTP":
          secretKey = config.otpSecret.signup_otp_secret;
          break;
        case "RESET_PASSWORD":
          secretKey = config.otpSecret.reset_password_secret;
          break;
        case "FORGET_PASSWORD":
          secretKey = config.otpSecret.forget_password_secret
          break;
        default:
          throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reason provided");
      }

      if (!secretKey) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Secret key missing");
      }


      const verifiedUser = jwtHelpers.verifyToken(token, secretKey);

      const existingUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });
      // console.log({ "52": existingUser })
      if (!existingUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User not found!");
      }

      if (existingUser.status === UserStatus.DELETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This user is deleted ! ");
      }

      if (existingUser.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }
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

export default verifyOtpToken;
