"use client";

import { CustomDropdown } from "@/components/shared/CustomDropdown";
import useAuth from "@/hooks/useAuth";
import {
  useDeleteCarePlanMutation,
  useGetAllCarePlanQuery,
} from "@/redux/api/careplan/careplanApi";
import { ICarePlan } from "@/types/global";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pagination } from "../../pagination";
import { CarePlanCard } from "./carePlanCard";
import { CarePlanCardSkeleton, EmptyState } from "./fallback";
import { Modal } from "./modal";
const statusOptions = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
  { value: "COMPLETED", label: "COMPLETED" },
];
export default function CarePlansDashboard() {
  const sp = useSearchParams();
  const isAuthenticated = useAuth();

  //  custom func for patching url
  const setParams = useSetParamsForPagination();

  // URL state
  const urlPage = Number(sp.get("page") || 1);
  const urlLimit = Number(sp.get("limit") || 10);
  const status = sp.get("status") || undefined;

  // get all care plans
  const { data: allCarePlans, isLoading: isAllCarePlansLoading } =
    useGetAllCarePlanQuery(
      isAuthenticated ? { page: urlPage, limit: urlLimit, status } : undefined,
      { skip: !isAuthenticated },
    );

  const [deleteCarePlan, { isLoading: isCarePlanDeleting }] =
    useDeleteCarePlanMutation();

  //   console.log(allCarePlans);

  //   const setParam = useCallback(
  //     (patch: Record<string, string | number | boolean | null | undefined>) => {
  //       const next = new URLSearchParams(sp.toString());
  //       Object.entries(patch).forEach(([k, v]) => {
  //         if (v === undefined || v === null || v === "") next.delete(k);
  //         else next.set(k, String(v));
  //       });
  //       router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  //     },
  //     [router, sp, pathname]
  //   );

  //   handle status change

  const handleStatusChange = (status: string) => {
    // console.log(status);
    setParams({ status });
  };
  const [selectedPlan, setSelectedPlan] = useState<ICarePlan | null>(null);

  //   handle delete plan

  const handleDelete = async (plan: string) => {
    // console.log(plan);

    try {
      await deleteCarePlan(plan).unwrap();
      setSelectedPlan(null);
      toast.success("Plan deleted successfully!");
    } catch (error) {
      toast.error("Something went wrong!");
      console.log(error);
    }
  };

  // meta
  const totalPages = allCarePlans?.meta?.totalPage ?? 1;
  const totalItems = allCarePlans?.meta?.total ?? 0;
  const page = allCarePlans?.meta?.page ?? urlPage;
  const limit = allCarePlans?.meta?.limit ?? urlLimit;

  const selectedStatus = sp.get("status") ?? "";

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="">
        <div className="md:flex items-center justify-between">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Care Plans
            </h1>
            <p className="text-gray-600">
              View, manage, and create your personal care plans.
            </p>
          </div>

          {/* custom dropdown */}
          <CustomDropdown
            options={statusOptions}
            placeholder="All Status"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full min-w-40 md:w-fit"
          />
        </div>

        {/* Care Plans Grid */}
        <div className="mt-6 grid gap-4 sm:gap-6 mb-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {allCarePlans?.data?.length ? (
            allCarePlans.data.map((plan) => (
              <CarePlanCard
                key={plan.id}
                plan={plan}
                onView={(p) => {
                  setSelectedPlan(plan);
                  console.log(p);
                }}
                onDelete={(p) => handleDelete(p)}
                isCarePlanDeleting={isCarePlanDeleting}
              />
            ))
          ) : isAllCarePlansLoading ? (
            // skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <CarePlanCardSkeleton key={i} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      {/* View Details Modal */}
      <Modal
        careplan={selectedPlan as ICarePlan}
        onClose={() => setSelectedPlan(null)}
      />

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        totalPages={totalPages}
        itemsPerPage={limit}
      />
    </div>
  );
}
