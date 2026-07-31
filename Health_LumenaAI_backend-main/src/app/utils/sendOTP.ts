import ApiError from "../errors/ApiError";
import prisma from "../lib/prisma";
import { generateOTP } from "./generateOTP";
import { createEmailTemplate, sendMail } from "./sendEmail";
import status from "http-status";
// Then in Step 4:

export const sendOTP = async (userId: string) => {
  // Step 1️⃣: Generate OTP and expiry time
  const otpCode = generateOTP().toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

  // Step 2️⃣: Upsert OTP
  const otp = await prisma.oTP.upsert({
    where: { userId },
    update: {
      otpCode,
      otpExpiresAt,
      updatedAt: new Date(),
    },
    create: {
      otpCode,
      otpExpiresAt,
      userId,
    },
  });

  // Step 3️⃣: Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    throw new ApiError(status.NOT_FOUND, "User not found while sending OTP!");
  }

  const otpContent = `
  <h2 style="text-align: center; color: #ffffff;">Verify Your OTP Within 10 Minutes</h2>
  <div style="padding: 0 1em;">
    <p style="text-align: center; line-height: 28px; color: #fff;">
      <strong style="color: #ffffff; font-size: 24px;">${otpCode}</strong>
    </p>
  </div>
`;
  // Step 4️⃣: Send OTP via email
  const res = await sendMail({
    to: user.email,
    subject: "Verify Your OTP within 10 Minutes",
    html: createEmailTemplate(otpContent),
  });
  console.log("res", res)
  return {
    message: "OTP sent successfully",
    expiresAt: otp.otpExpiresAt,
  };
};
