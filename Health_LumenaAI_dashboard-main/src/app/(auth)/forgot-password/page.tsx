"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/redux/api/auth/authApi";
import { setEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch } from "@/redux/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [resetPassword, { isLoading: isForgottingAndOTPSending }] =
    useForgotPasswordMutation();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const result = await resetPassword({ email: data.email }).unwrap();
      console.log(result);

      if (result?.success) {
        toast.success(result?.message);
        router.replace("verify-email");
        dispatch(setEmail(data.email));
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
    // console.log("Login attempt:", data);
    // localStorage.setItem("verify-email", data?.email);
    // Add login logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg mx-auto mt-10 md:mt-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset your password
          </h1>
          <p className="text-gray-600">
            We&lsquo;ll send you a secure link to quickly reset your password.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-custom p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="relative border border-black rounded-md">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    className="pl-10 h-12 bg-inputBg focus:ring-[1.5px] focus:ring-primary border-none"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 absolute">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isForgottingAndOTPSending}
              className="mt-6 w-full h-12 bg-primary hover:bg-primary/90 text-slate-900 font-medium rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {isSubmitting ||
                (isForgottingAndOTPSending && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                ))}
              <div className="flex items-center justify-center gap-2">
                {isSubmitting ||
                  (isForgottingAndOTPSending && (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ))}
                {isSubmitting || isForgottingAndOTPSending
                  ? "Sending..."
                  : "Send Code"}
              </div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
