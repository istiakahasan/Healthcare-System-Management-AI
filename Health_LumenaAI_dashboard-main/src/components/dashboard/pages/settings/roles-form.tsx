"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const rolesSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "moderator", "editor"]),
});

type RolesFormValues = z.infer<typeof rolesSchema>;

interface User {
  id: string;
  email: string;
  role: "admin" | "moderator" | "editor";
}

export const RolesForm = () => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@example.com", role: "admin" },
    { id: "2", email: "moderator@careplatform.com", role: "moderator" },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RolesFormValues>({
    resolver: zodResolver(rolesSchema),
    defaultValues: { email: "", role: "moderator" },
  });

  const onSubmit = (data: RolesFormValues) => {
    const newUser: User = {
      id: Date.now().toString(), // random id
      email: data.email,
      role: data.role,
    };
    setUsers((prev) => [...prev, newUser]);
    form.reset();
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log("Roles saved:", users);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    form.reset();
  };

  return (
    <div className="space-y-8">
      {/* Add User Form */}
      <div className="rounded-lg border border-input bg-card p-4 sm:p-6">
        <h3 className="mb-4 text-base sm:text-lg font-semibold">
          Add Admin User
        </h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* mobile: 1-col, md: 3-col */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder="user@example.com"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* submit button: full width on mobile */}
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-semibold">Current Users</h3>

        {users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input p-6 text-center">
            <p className="text-sm text-muted-foreground">No users added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="
                  rounded-lg border border-input bg-card p-4
                  flex flex-col gap-3
                  sm:flex-row sm:items-center sm:justify-between
                "
              >
                {/* email + role group */}
                <div className="min-w-0 flex-1">
                  <p
                    className="font-medium text-foreground truncate"
                    title={user.email}
                  >
                    {user.email}
                  </p>

                  {/* On small screens show role under email; on >=sm keep right-aligned chip */}
                  <div className="mt-2 sm:hidden">
                    <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="hidden sm:inline rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                    {user.role}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(user.id)}
                    aria-label={`Remove ${user.email}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 sm:pt-6">
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto hover:cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};
