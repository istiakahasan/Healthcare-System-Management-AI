/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { format } from "date-fns";
import { useState } from "react";
import { getDataByTab } from "./data";
import { Modal } from "./modal";
import { ReportsTable } from "./reportsTable";
import { Tabs } from "./tabs";
import { StaffReport, TabValue } from "./types";

import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/utils/icons";
import { useDatePicker } from "@/utils/useDatePicker";
import { CalendarIcon } from "lucide-react";

export default function StaffReportsDashboard() {
  // for Datepicker
  const { date, openCalendar, resetDate, setDate, setOpenCalendar, today } =
    useDatePicker();
  console.log(date);
  //
  const [activeTab, setActiveTab] = useState<TabValue>("Active");
  const [selectedReport, setSelectedReport] = useState<StaffReport | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const currentData = getDataByTab(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-8 border rounded-lg">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Search and Date Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F8F8F8]"
              />
            </div>
            {/* Date Filter */}
            <div>
              {/* <Label htmlFor="date" className="px-1 pb-1 font-normal">
                Date Filter
              </Label> */}
              <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">
                      {date ? format(date, "PPP") : "Date Filter"}
                    </span>
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                  sideOffset={6}
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    disabled={(d) => d < today}
                    onSelect={(d) => {
                      if (!d) return;
                      setDate(d);
                      setOpenCalendar(false);
                    }}
                    captionLayout="dropdown"
                    className="rounded-md border shadow-sm bg-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* Tabs */}
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Table */}
          <ReportsTable data={currentData} onView={setSelectedReport} />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6">
            <p className="text-sm text-gray-600">
              Showing {currentData.length} out of 1,450
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                &lt; Previous
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                2
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                3
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                –
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                16
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
