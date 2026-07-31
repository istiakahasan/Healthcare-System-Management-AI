import status from "http-status";
import { AuthService } from "./auth.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { Request, Response } from "express";


const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
 const result= await AuthService.verifyOtp(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "OTP verified successfully!",
    data:result
  });
});
const verifyOtpInSignUp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result=await AuthService.verifyOtpInSignUp(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "SignUp OTP verified successfully!",
    data:result
  });
});


const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email as string;
  const { currentPassword, newPassword } = req.body;
  await AuthService.changePassword(email, currentPassword, newPassword);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User password changed successfully!",
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;

  const result = await AuthService.resetPassword(
    req.user.email,
    newPassword,
    confirmPassword
  );

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await AuthService.resendOtp(email);

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
  });
});



export const AuthController = {
  login,
  resendOtp,
  verifyOtp,
  verifyOtpInSignUp,
  resetPassword,
  forgotPassword,
  changePassword,
};
