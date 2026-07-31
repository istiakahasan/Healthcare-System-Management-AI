/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import InlineLoader from "@/components/shared/InlineLoader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/redux/api/auth/authApi";
import { useGetMeQuery } from "@/redux/api/getMe/getMeApi";
import { useUpdateProfileMutation } from "@/redux/api/settings/settingsApi";
import { useAppSelector } from "@/redux/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import SettingsSkeleton from "./SettingsSkeleton";

// ------------ VALIDATION SCHEMAS ------------
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required!"),
  lastName: z.string().min(1, "Last name is required!"),
  address: z.string().optional(),
  email: z.string().email(),
  image: z.any().optional(),
});

// For password
const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long!"),
    confirmPassword: z.string().min(1, "Please confirm your new password!"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

export default function SettingsPage() {
  // token
  const token = useAppSelector((state) => state.auth.accessToken);

  const { data: user, isLoading: isUserLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  const [resetPassword, { isLoading: isPasswordResetting }] =
    useResetPasswordMutation();

  const [imagePreview, setImagePreview] = useState("/default-user.png");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ------------ PROFILE FORM ------------
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      email: "",
    },
  });

  // Load user data into form
  useEffect(() => {
    if (user?.data) {
      const addr =
        Array.isArray(user.data.address) && user.data.address.length > 0
          ? user.data.address[0]
          : "";

      profileForm.reset({
        firstName: user.data.firstName,
        lastName: user.data.lastName,
        address: addr,
        email: user.data.email,
      });

      setImagePreview(
        user.data.profileImage && user.data.profileImage !== ""
          ? user.data.profileImage
          : "/default-user.png",
      );
    }
  }, [user, profileForm]);

  // ------------ HANDLERS ------------
  const handleProfileSubmit = async (data: any) => {
    const formData = new FormData();

    if (data.image) {
      formData.append("profileImage", data.image);
    }

    const bodyData = {
      firstName: data.firstName,
      lastName: data.lastName,
      //   address: data.address,
      //   address: { city: data.address },
    };

    formData.append("bodyData", JSON.stringify(bodyData));

    try {
      const result = await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully!");
      console.log(result);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      profileForm.setValue("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordSubmit = async (data: any) => {
    console.log(data);
    try {
      const payload = {
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        token: token ?? "",
      };

      const result = await resetPassword(payload).unwrap();
      console.log(result);

      if (result?.success) {
        toast.success(result?.message);
        // Clear form after success
        passwordForm.reset();
      }
    } catch (error: any) {
      console.log(error);
      const errMsg =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        error?.message ||
        "Failed to update password, please try again!";

      toast.error(errMsg);
    }
  };
  if (isUserLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="w-full bg-gray-50 rounded-2xl p-4 md:p-0">
      <Card className="w-full p-6 md:p-10 bg-white">
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>

        {/* -------- IMAGE UPLOAD -------- */}
        <div className="flex justify-start mb-6">
          <div className="relative w-28 h-28">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 relative">
              <Image
                src={imagePreview || ""}
                alt="Profile"
                fill
                priority
                draggable={false}
                className="object-cover"
              />
            </div>

            <label className="absolute -bottom-1 -right-1 bg-primary p-2 rounded-full cursor-pointer shadow-lg z-20 border-2 border-white">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <hr className="my-8" />

        {/* ----- PROFILE FORM -------- */}
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <Input {...profileForm.register("firstName")} className="mt-1" />
            </div>

            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <Input {...profileForm.register("lastName")} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* <div>
              <label className="text-sm text-gray-600">Address</label>
              <Input {...profileForm.register("address")} className="mt-1" />
              {profileForm.formState.errors.address && (
                <p className="text-xs text-red-500 mt-1">
                  {profileForm.formState.errors.address.message}
                </p>
              )}
            </div> */}

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <Input
                {...profileForm.register("email")}
                className="mt-1"
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            {/* <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </Button> */}

            <Button
              type="submit"
              disabled={isUpdatingProfile}
              className="bg-primary hover:bg-yellow-500 hover:cursor-pointer disable:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? (
                <InlineLoader text="Saving..." />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>

        <hr className="my-10" />

        {/* --------- PASSWORD FORM ----- */}
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NEW PASSWORD */}
            <div>
              <label className="text-sm text-gray-600">New Password</label>
              <div className="relative mt-1">
                <Input
                  type={showNewPass ? "text" : "password"}
                  {...passwordForm.register("newPassword")}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
                  onClick={() => setShowNewPass(!showNewPass)}
                >
                  {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="text-sm text-gray-600">Confirm Password</label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPass ? "text" : "password"}
                  {...passwordForm.register("confirmPassword")}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              disabled={isPasswordResetting}
              className="hover:cursor-pointer disable:opacity-50 disabled:cursor-not-allowed"
              onClick={() => passwordForm.reset()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPasswordResetting}
              className="bg-primary hover:bg-yellow-500 hover:cursor-pointer disable:opacity-50 disabled:cursor-not-allowed"
            >
              {isPasswordResetting ? (
                <InlineLoader text="Saving..." />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
