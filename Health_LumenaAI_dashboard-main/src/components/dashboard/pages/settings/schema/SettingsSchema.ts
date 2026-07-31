import * as z from "zod";

// Profile schema
export const profileSchema = z.object({
  firstName: z.string({
    message: "First name is required!",
  }),
  lastName: z.string({
    message: "Last name is required!",
  }),
  location: z.string({
    message: "Location is required!",
  }),
  email: z.email({
    message: "Email is required!",
  }),
});

// Notification schema
export const notificationSchema = z.object({
  platformNotification: z.boolean(),
});

// Password schema
export const passwordSchema = z.object({
  oldPassword: z.string().min(8, "Password must be at least 8 characters long"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type NotificationValues = z.infer<typeof notificationSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
