"use client";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  bookingAlerts: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const defaultValues: NotificationFormValues = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  bookingAlerts: true,
};

const notificationOptions = [
  {
    id: "emailNotifications",
    label: "Email Notifications",
    description: "Send notifications via email",
  },
  {
    id: "smsNotifications",
    label: "SMS Notifications",
    description: "Send notifications via SMS",
  },
  {
    id: "pushNotifications",
    label: "Push Notifications",
    description: "Send push notifications to mobile apps",
  },
  {
    id: "bookingAlerts",
    label: "New Booking Alerts",
    description: "Alert when new bookings are created",
  },
];

export function NotificationForm() {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues,
  });

  async function onSubmit(data: NotificationFormValues) {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Notifications saved:", data);
    } finally {
      setIsSaving(false);
    }
  }

  function onCancel() {
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          {notificationOptions.map((option) => (
            <FormField
              key={option.id}
              control={form.control}
              name={option.id as keyof NotificationFormValues}
              render={({ field }) => (
                <div className="flex items-center justify-between rounded-lg border border-input p-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-base font-medium text-foreground">
                      {option.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <Switch
                    className=""
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="hover:cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
