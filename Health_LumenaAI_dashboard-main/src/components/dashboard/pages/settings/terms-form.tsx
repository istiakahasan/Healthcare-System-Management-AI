"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const termsSchema = z.object({
  termsOfService: z
    .string()
    .min(10, "Terms of Service must be at least 10 characters"),
  privacyPolicy: z
    .string()
    .min(10, "Privacy Policy must be at least 10 characters"),
});

type TermsFormValues = z.infer<typeof termsSchema>;

const defaultValues: Partial<TermsFormValues> = {
  termsOfService: "",
  privacyPolicy: "",
};

export function TermsForm() {
  const [termsFile, setTermsFile] = useState<File | null>(null);
  const [privacyFile, setPrivacyFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const termsFileInputRef = useRef<HTMLInputElement>(null);
  const privacyFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TermsFormValues>({
    resolver: zodResolver(termsSchema),
    defaultValues,
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setFile(file);
    }
  };

  const handleTermsClick = () => {
    termsFileInputRef.current?.click();
  };

  const handlePrivacyClick = () => {
    privacyFileInputRef.current?.click();
  };

  async function onSubmit(data: TermsFormValues) {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Terms saved:", {
        ...data,
        termsFile: termsFile?.name,
        privacyFile: privacyFile?.name,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function onCancel() {
    form.reset();
    setTermsFile(null);
    setPrivacyFile(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Terms of Service */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="termsOfService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms of Service</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter terms of service..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="mb-2 block">
              Upload Terms of Service
            </FormLabel>
            <div
              onClick={handleTermsClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-6 py-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {termsFile ? (
                <span className="text-sm font-medium text-foreground">
                  ✓ {termsFile.name}
                </span>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload Terms of Service (PDF, Doc)
                  </span>
                </>
              )}
            </div>
            <input
              ref={termsFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, setTermsFile)}
              className="hidden"
            />
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="privacyPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Privacy Policy</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter privacy policy..."
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="mb-2 block">Upload Privacy Policy</FormLabel>
            <div
              onClick={handlePrivacyClick}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-6 py-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
            >
              {privacyFile ? (
                <span className="text-sm font-medium text-foreground">
                  ✓ {privacyFile.name}
                </span>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload Privacy Policy (PDF, Doc)
                  </span>
                </>
              )}
            </div>
            <input
              ref={privacyFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, setPrivacyFile)}
              className="hidden"
            />
          </div>
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
