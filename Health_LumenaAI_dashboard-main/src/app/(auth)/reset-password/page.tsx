/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/redux/api/auth/authApi";
import { clearResetPassToken } from "@/redux/features/user/authSlice";
import { selectEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.resetPassToken);
  const [resetPassword, { data, isLoading: isLoadingResetPassword }] =
    useResetPasswordMutation();

  // get stored email for verify otp from redux
  const emailFromStore = useAppSelector(selectEmail);

  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // Simulate API call

      if (emailFromStore && token) {
        const result = await resetPassword({
          newPassword: data.confirmPassword,
          confirmPassword: data.confirmPassword,
          token: token,
        }).unwrap();
        console.log(result);

        if (result?.success) {
          toast.success(result?.message);
          // Clear form after success
          reset();

          //   remove stored accessToken -> user have to login now
          dispatch(clearResetPassToken());

          // Show success message
          setSuccessMessage("Password reset successfully. Please login again!");
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
          router.push("/reset-success");
        }
      }
    } catch (error) {
      toast.error("Password reset failed!");
      console.error("Password reset failed:", error);
    }
  };
  //   if email not found in store redirect to login page
  useEffect(() => {
    if (!emailFromStore) return router.replace("/login");
  }, [router, emailFromStore]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg mx-auto mt-10 md:mt-20">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-delay-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">Enter a new password to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-custom p-8 animate-slide-up">
          {/* Success Message */}
          {successMessage && (
            <div className="text-center mb-6">
              <p className="text-sm text-green-600 animate-fade-in bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Field */}
            <div className="animate-fade-in-delay-3">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative border border-black rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword")}
                  placeholder="Enter your password"
                  className="pl-10 pr-12 h-12 bg-inputBg focus:ring-[1.5px] focus:ring-primary border-none transition-all duration-300 "
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200 hover:cursor-pointer"
                >
                  {showNewPassword ? (
                    <Eye className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-xs text-red-500 animate-slide-in-error">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="animate-fade-in-delay-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative border border-black rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-12 h-12 bg-inputBg focus:ring-[1.5px] focus:ring-primary border-none transition-all duration-300 "
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200 hover:cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <Eye className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-500 animate-slide-in-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="animate-fade-in-delay-5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full h-12 bg-primary hover:bg-primary/90 text-slate-900 font-medium rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {isSubmitting && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
