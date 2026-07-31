/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";

import { CustomDropdown } from "@/components/shared/CustomDropdown";
import StatsCard from "@/components/shared/StatsCard";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetAllShiftsQuery,
  useGetShiftsStatsQuery,
  useDeleteShiftMutation,
} from "@/redux/api/shifts/shiftsApi";
import { IShift } from "@/types/global";
import { Icons } from "@/utils/icons";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { toast } from "sonner";
import { Pagination } from "../../pagination";
import Modal from "./Modal";
import { ShiftsTable } from "./shiftsTable";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "COMPLETED", label: "Completed" },
];

export default function ShiftsPage() {
  const sp = useSearchParams();
  const isAuthenticated = useAuth();

  const setParams = useSetParamsForPagination();

  // URL state
  const urlPage = Number(sp.get("page") || 1);
  const urlLimit = Number(sp.get("limit") || 10);
  const searchTerm = sp.get("searchTerm") || "";
  const status = sp.get("status") || "";

  // local UI state
  const [searchTermQuery, setSearchTermQuery] = useState(searchTerm);
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null);

  const debouncedSearch = useDebounce(searchTermQuery, 500);

  useEffect(() => {
    const current = sp.get("searchTerm") ?? "";
    if (current !== (debouncedSearch || "")) {
      setParams({ searchTerm: debouncedSearch || null, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // filters -> URL
  const handleStatusChange = (value: string) => {
    // value: "", "true", "false"
    setParams({ status: value || null });
  };

  //   get shifts stats
  const { data: shiftsStats, isLoading: isShiftsStatsLoading } =
    useGetShiftsStatsQuery(undefined, {
      skip: !isAuthenticated,
    });

  // Query call
  const { data: allShifts, isLoading } = useGetAllShiftsQuery(
    isAuthenticated
      ? {
        page: urlPage,
        limit: urlLimit,
        status,
        searchTerm: debouncedSearch || undefined,
      }
      : undefined,
    { skip: !isAuthenticated }
  );

  //   console.log(allShifts);

  // meta
  const totalPages = allShifts?.meta?.totalPage ?? 1;
  const totalItems = allShifts?.meta?.total ?? 0;
  const page = allShifts?.meta?.page ?? urlPage;
  const limit = allShifts?.meta?.limit ?? urlLimit;

  // values for dropdowns (controlled by URL)
  const statusFilterValue = sp.get("status") ?? "";

  // delete shift mutation
  const [deleteShift] = useDeleteShiftMutation();

  // shift delete
  const handleDeleteShift = async (shiftId: string) => {
    const toastId = toast.loading("Deleting shift...");
    try {
      const res = await deleteShift(shiftId).unwrap();
      if (res?.success) {
        toast.success(res?.message || "Shift deleted successfully!", {
          id: toastId,
        });
      } else {
        toast.error(res?.message || "Failed to delete shift!", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong!", {
        id: toastId,
      });
    }
  };

  const markComplete = (shiftId: string) => {
    console.log(shiftId);
    setSelectedShift(null);
    toast.warning("Shift mark complete API is missing!");
  };

  const markReject = (shiftId: string) => {
    console.log(shiftId);
    setSelectedShift(null);
    toast.warning("Shift reject API is missing!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-0">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Shifts"
          icon="Calendar"
          value={shiftsStats?.data?.totalShifts || 0}
          valueText="Shifts"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isShiftsStatsLoading}
        />
        <StatsCard
          title="Assigned Staff in Shift"
          icon="Users"
          value={shiftsStats?.data?.assignedStaffInShift || 0}
          valueText="Staff"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isShiftsStatsLoading}
        />
        <StatsCard
          title="Shifts Completed"
          icon="CheckCircle"
          value={shiftsStats?.data?.shiftsCompletedInThisMonth || 0}
          valueText=""
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          isLoading={isShiftsStatsLoading}
        />
        <StatsCard
          title="Canceled Shifts"
          icon="FiXCircle"
          value={shiftsStats?.data?.totalCancelShifts || 0}
          valueText=""
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          isLoading={isShiftsStatsLoading}
        />
      </div>

      {/* Main card */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className=" rounded-lg">
          <div className="md:flex items-center justify-between mb-10 space-y-6 md:space-y-0">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search shifts..."
                className="pl-10"
                value={searchTermQuery}
                onChange={(e) => setSearchTermQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <CustomDropdown
                options={statusOptions}
                placeholder="All Status"
                value={statusFilterValue}
                onChange={handleStatusChange}
                className="w-full"
              />
            </div>
          </div>

          <ShiftsTable
            shifts={(allShifts?.data as IShift[]) || []}
            onView={setSelectedShift}
            handleDeleteShift={handleDeleteShift}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        <div className="mt-6">
          {/* totalPages totalItems page limit */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        shift={selectedShift}
        onClose={() => setSelectedShift(null)}
        markComplete={markComplete}
        markReject={markReject}
      />
    </div>
  );
}
