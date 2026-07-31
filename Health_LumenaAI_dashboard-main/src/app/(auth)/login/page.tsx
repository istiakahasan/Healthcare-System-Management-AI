"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useLoginMutation } from "@/redux/api/auth/authApi";
import { useLazyGetMeQuery } from "@/redux/api/getMe/getMeApi";
import { setTokens, setUser } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import type { ILoginPayload } from "@/types/global";

// Schema & Types

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Component

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [triggerGetMe] = useLazyGetMeQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Log the login data for test
    // console.log("Login attempts", data);
    try {
      const result = await login(data as ILoginPayload).unwrap();

      const accessToken = result?.data?.accessToken;
      if (!result?.success || !accessToken) {
        // console.error("Unexpected login response:", result);
        toast.error("Something went wrong. Please try again.");
        return;
      }

      dispatch(setTokens({ accessToken }));

      const profile = await triggerGetMe().unwrap();
      //   console.log(profile);
      // Save user in store
      dispatch(setUser(profile.data ?? null));

      // Navigate & toast
      toast.success("Login successful");
      router.replace("/dashboard");
    } catch (err) {
      console.log(err);
      toast.error("Login failed!");
    }
  };

  const loading = isSubmitting || isLoginLoading;

  return (
    <div className="min-h-screen pt-20 bg-linear-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Top Banner / Brand */}
      <header className="px-6 pt-10">
        <div className="mx-auto max-w-6xl flex items-center justify-center gap-3">
          <div className="hidden  h-12 w-12 rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300 sm:flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              LumenaAI Admin
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Sign in to manage the dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Auth Card */}
      <main className="px-4 pb-12 pt-8">
        <div className="mx-auto max-w-md">
          <div className="relative rounded-2xl bg-white/90 backdrop-blur shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
            {/* subtle accent */}
            <div className="absolute -top-3 left-6 inline-flex items-center gap-2 rounded-full border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Access
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="admin@company.com"
                      className="h-12 pl-10 pr-3 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-primary"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-800 dark:text-slate-100"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline "
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 pl-10 pr-10 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-primary"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-primary/90 hover:bg-primary text-slate-900 font-medium disabled:opacity-60 hover:cursor-pointer"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
