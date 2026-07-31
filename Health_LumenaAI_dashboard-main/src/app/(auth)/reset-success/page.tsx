"use client";
import { Button } from "@/components/ui/button";
import { clearEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch } from "@/redux/hook";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ResetSuccessPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualRedirect = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  //   clear email for otp verify after password reset success and redirect to this page
  useEffect(() => {
    dispatch(clearEmail());
  }, [dispatch, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg ">
        <div className="bg-white rounded-2xl shadow-custom p-8 animate-slide-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Image
              src="/reset-successful.png"
              alt="Password Reset Successful"
              width={250}
              height={250}
              className="w-auto h-auto"
              priority
              draggable={false}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-delay-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful
            </h1>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now sign in with your new
              password.
            </p>

            {/* Sign In redirect Button */}
            <div className="animate-fade-in-delay-5">
              <Button
                onClick={handleManualRedirect}
                disabled={isSubmitting}
                className="mt-6 w-full h-12 bg-primary hover:bg-primary/90 text-slate-900 font-medium rounded-lg hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
                <div className="flex items-center justify-center gap-2">
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? "Redirecting..." : "Sign In"}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccessPage;
