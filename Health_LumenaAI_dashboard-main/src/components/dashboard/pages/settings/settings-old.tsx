"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BrandingForm } from "./branding-form";
import { CommissionForm } from "./commission-form";
import { NotificationForm } from "./notification-form";
import { RolesForm } from "./roles-form";
import { TermsForm } from "./terms-form";

const TABS = [
  { id: "branding", label: "Branding & Appearance" },
  { id: "commission", label: "Commission Rate Settings" },
  { id: "notifications", label: "Notification Preferences" },
  { id: "terms", label: "Terms & Policies" },
  { id: "roles", label: "Roles & Permissions" },
];

const SettingsPageOld = () => {
  const [activeTab, setActiveTab] = useState("branding");
  return (
    <div>
      {" "}
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Platform Settings
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage site-wide configurations and preferences.
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid gap-2 w-full md:grid-cols-2 xl:grid-cols-5 p-4">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="text-gray-600 text-xs sm:text-base hover:cursor-pointer rounded-full py-3"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              <div className="mt-8">
                <TabsContent value="branding" className="space-y-6">
                  <BrandingForm />
                </TabsContent>

                <TabsContent value="commission" className="space-y-6">
                  <CommissionForm />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <NotificationForm />
                </TabsContent>

                <TabsContent value="terms" className="space-y-6">
                  <TermsForm />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                  <RolesForm />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageOld;
