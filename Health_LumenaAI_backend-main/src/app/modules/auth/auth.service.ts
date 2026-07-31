import status from "http-status";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { passwordCompare } from "../../utils/comparePasswords";
import config from "../../../config";
import { createToken } from "./auth.utils";
import bcrypt from "bcrypt";
import { StaffStatus, UserRole } from "@prisma/client";
import { sendOTP } from "../../utils/sendOTP";

const verifyOtpInSignUp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }
  const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } });

  if (!savedOtp) {
    throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
  }

  if (savedOtp.otpExpiresAt! < new Date()) {
    throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
  }

  if (Number(savedOtp.otpCode) !== Number(otp)) {
    throw new ApiError(status.BAD_REQUEST, "OTP not matched!");
  }

  // update database
  await prisma.$transaction(async (tx) => {
    await tx.oTP.delete({
      where: { id: savedOtp.id },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });
  });

  const jwtPayload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
  if (user.role === UserRole.CUSTOMER) {
    const accessToken = createToken(
      jwtPayload,
      config.jwt.access_secret as string,
      config.jwt.access_token_expires_in as string
    );
    return {
      accessToken,
    };
  } else if (user.role === UserRole.STAFF) {
    return {
      message:
        "Your submission is awaiting admin verification. You’ll be notified once it’s approved or requires action.",
    };
  }
};

const verifyOtp = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }
  const savedOtp = await prisma.oTP.findUnique({ where: { userId: user.id } });

  if (!savedOtp) {
    throw new ApiError(status.BAD_REQUEST, "OTP Not found!");
  }

  if (savedOtp.otpExpiresAt! < new Date()) {
    throw new ApiError(status.BAD_REQUEST, "OTP has expired!");
  }

  if (Number(savedOtp.otpCode) !== Number(otp)) {
    throw new ApiError(status.BAD_REQUEST, "OTP not matched!");
  }

  // update database
  await prisma.$transaction(async (tx) => {
    await tx.oTP.delete({
      where: { id: savedOtp.id },
    });

    await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        isVerified: true,
      },
    });
  });

  const jwtPayload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_token_expires_in as string
  );
  if (user.role === UserRole.CUSTOMER) {
    return {
      accessToken,
    };
  } else if (user.role === UserRole.STAFF) {
    const stuff = await prisma.staff.findUnique({ where: { userId: user.id } });
    if (stuff?.staffStatus === StaffStatus.INACTIVE) {
      return {
        message:
          "Your submission is awaiting admin verification. You’ll be notified once it’s approved or requires action.",
      };
    } else {
      return {
        accessToken,
      };
    }
  }
};

const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  if (!user.isVerified) {
    const res = await sendOTP(user.id);
    return {
      statusCode: status.PERMANENT_REDIRECT,
      message: `${res.message}!verify your account!`,
      redirectTo: "verify-otp",
    };
  }

  if (user.role === UserRole.STAFF) {
    const stuff = await prisma.staff.findUnique({ where: { userId: user.id } });
    if (stuff?.staffStatus === StaffStatus.INACTIVE) {
      return {
        message: "You can't login now! Please Wait for admin approval!",
      };
    }
  }

  const isPasswordMatched = await passwordCompare(
    password,
    user.password ?? ""
  );

  if (!isPasswordMatched) {
    throw new ApiError(status.UNAUTHORIZED, "Password is incorrect!");
  }

  const jwtPayload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_token_expires_in as string
  );

  return {
    accessToken,
  };
};

const changePassword = async (
  email: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  const isPasswordMatch = await passwordCompare(
    currentPassword,
    user.password ?? ""
  );

  if (!isPasswordMatch) {
    throw new ApiError(status.UNAUTHORIZED, "Current password is incorrect!");
  }
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedNewPassword,
    },
  });

  return null;
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  await sendOTP(user.id);

  return {
    message: "OTP has been sent to your email for password reset.",
  };
};

const resetPassword = async (
  email: string,
  newPassword: string,
  confirmPassword: string
) => {
  if (newPassword !== confirmPassword) {
    throw new ApiError(status.BAD_REQUEST, "Passwords do not match!");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }
  const isPasswordMatched = await passwordCompare(
    newPassword,
    user.password ?? ""
  );

  if (isPasswordMatched) {
    throw new ApiError(
      status.NOT_ACCEPTABLE,
      "This is your old password! Please choose a new one."
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      isResetPassword: false,
      canResetPassword: false,
    },
  });

  return {
    message: "Password reset successfully!",
  };
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found!");
  }

  await sendOTP(user.id);

  return {
    message: "New OTP has been sent to your email!",
  };
};

export const AuthService = {
  loginUser,
  resendOtp,
  verifyOtpInSignUp,
  resetPassword,
  changePassword,
  forgotPassword,
  verifyOtp,
};
