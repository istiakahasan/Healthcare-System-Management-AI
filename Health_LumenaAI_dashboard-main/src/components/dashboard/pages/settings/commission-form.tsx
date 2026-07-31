"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const commissionSchema = z.object({
  commissionRate: z
    .string()
    .refine(
      (val) =>
        !isNaN(Number.parseFloat(val)) &&
        Number.parseFloat(val) >= 0 &&
        Number.parseFloat(val) <= 100,
      "Commission rate must be between 0 and 100"
    ),
  minimumBookingAmount: z
    .string()
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0,
      "Amount must be a positive number"
    ),
});

type CommissionFormValues = z.infer<typeof commissionSchema>;

const defaultValues: Partial<CommissionFormValues> = {
  commissionRate: "15",
  minimumBookingAmount: "50",
};

export function CommissionForm() {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues,
  });

  async function onSubmit(data: CommissionFormValues) {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Commission saved:", data);
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
        {/* Commission Rate */}
        <FormField
          control={form.control}
          name="commissionRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform Commission Rate (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="15" {...field} />
              </FormControl>
              <FormDescription>
                The percentage taken from each transaction as platform
                commission.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Minimum Booking Amount */}
        <FormField
          control={form.control}
          name="minimumBookingAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Booking Amount ($)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
