/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/api/auth/authApi";
import { setResetPassToken } from "@/redux/features/user/authSlice";
import { selectEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useRouter } from "next/navigation";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  // get stored email for verify otp from redux
  const emailFromStore = useAppSelector(selectEmail);
  // console.log("emailFromStore", emailFromStore);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(""); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  //   handle submit after otp input
  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      if (emailFromStore) {
        const result = await verifyOtp({
          email: emailFromStore,
          otp: otpValue,
        }).unwrap();
        console.log("result", result);
        if (result?.success && result?.data?.accessToken) {
          dispatch(setResetPassToken(result?.data?.accessToken));
          toast.success(result?.message);
          router.replace("/reset-password");
        }
      } else {
        setError("Email is null, cannot resend OTP");
      }

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      inputRefs.current[0]?.focus();

      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      if (emailFromStore) {
        const result = await resendOtp({ email: emailFromStore }).unwrap();
        console.log(result);

        if (result?.success) {
          //   toast.success(result?.message);
          // Show success message
          setResendMessage(result?.message);
        }

        // Start 30-second countdown
        setResendCountdown(20);
      } else {
        setError("Email is null, cannot resend OTP");
      }

      //   console.log(`OTP resent successfully to ${emailFromStore}`);
    } catch (err) {
      setError("Failed to resend code. Please try again.");
      //   console.log("Resend failed:", err);
    } finally {
      setIsResending(false);
    }
  };

  //   if email not found in store redirect to login page
  useEffect(() => {
    if (!emailFromStore) return router.replace("/login");
  }, [router, emailFromStore]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (resendMessage) {
      const timer = setTimeout(() => {
        setResendMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resendMessage]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100  p-4">
      <div className="w-full max-w-md mx-auto mt-10 md:mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset your password
          </h1>
          <p className="text-gray-600">
            Please enter the 6-digit code we&lsquo;ve emailed to you.
          </p>
          <p className="text-gray-600 text-xs my-3">Demo OTP: 123456</p>
        </div>
        <div className="bg-white rounded-2xl shadow-custom p-8">
          <p className="text-left text-sm font-medium text-gray-700 mb-2">
            Enter Your Code
          </p>
          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-10 h-10 sm:w-12 sm:h-14 md:w-12 md:h-14 text-center text-lg font-medium border rounded-lg  
                 focus:border-blue-700  focus:outline-none 
                transition-all duration-200 flex-1 max-w-[50px] sm:max-w-none"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Resend Message */}
          {resendMessage && (
            <div className="text-center mb-4">
              <p className="text-sm text-green-600 animate-fade-in">
                {resendMessage}
              </p>
            </div>
          )}

          {/* Resend Button */}
          <div className="text-center mb-4">
            <span className="text-gray-600 text-sm">
              {"Didn't receive the code? "}
              <button
                onClick={handleResend}
                disabled={resendCountdown > 0 || isResending}
                className={`font-medium transition-all duration-200 ${
                  resendCountdown > 0 || isResending
                    ? "text-gray-400 cursor-not-allowed "
                    : "text-purple-600 hover:text-purple-700 hover:underline hover:cursor-pointer"
                }`}
              >
                {isResending
                  ? "Sending..."
                  : resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : "Resend"}
              </button>
            </span>
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || otp.join("").length !== 6}
            className="mt-6 w-full h-12 bg-primary hover:bg-primary/90 text-slate-900 font-medium rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            {isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            <div className="flex items-center justify-center gap-2">
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? "Verifying..." : "Verify"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
