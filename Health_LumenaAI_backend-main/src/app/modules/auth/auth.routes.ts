import { UserRole } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/verify-otp", AuthController.verifyOtp);
router.post("/verify-otp-signup", AuthController.verifyOtpInSignUp);

router.post(
  "/login",
  AuthController.login
);

router.patch(
  "/change-password",
  auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.ADMIN),
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  AuthController.forgotPassword
);

router.post("/reset-password",auth(), AuthController.resetPassword);

router.post(
  "/resend-otp",
  AuthController.resendOtp
);

export const AuthRoutes = router;
