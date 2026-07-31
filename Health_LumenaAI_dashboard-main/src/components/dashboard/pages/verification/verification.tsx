"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import {
  useApproveStaffMutation,
  useGetPendingStaffsQuery,
  useRejectStaffMutation,
} from "@/redux/api/verification/verificationApi";
import { IPendingUser } from "@/types/global";
import { Icons } from "@/utils/icons";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pagination } from "../../pagination";
import { PendingUserModal } from "./pending-user-modal";

// Skeleton Component
const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5 animate-pulse">
      {/* Profile Section */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Profile Image Skeleton */}
        <div className="shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200" />
        </div>

        {/* User Info Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 h-9 sm:h-10 bg-gray-200 rounded-md" />
        <div className="flex-1 h-9 sm:h-10 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
};

// Skeleton Loading State
const SkeletonLoading = () => {
  return (
    <div className="mt-10 bg-gray-50">
      <div className="max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8 animate-pulse">
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-96 max-w-full" />
        </div>

        {/* Stats Banner Skeleton */}
        <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 lg:mb-10 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Verification = () => {
  const [processingStaff, setProcessingStaff] = useState<{
    id: string;
    action: "approve" | "reject";
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<IPendingUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAuthenticated = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  // get unverified staff
  const {
    data: pendingStaffs,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetPendingStaffsQuery(isAuthenticated ? { page, limit } : undefined, {
    skip: !isAuthenticated,
  });

  // Sync page state with backend meta if available and out of bounds
  useEffect(() => {
    if (pendingStaffs?.data?.meta) {
      const { totalPage } = pendingStaffs.data.meta;
      if (page > totalPage && totalPage > 0) {
        setPage(totalPage);
      }
    }
  }, [pendingStaffs?.data?.meta, page]);

  //   approve staff and reject staff mutation
  const [approveStaff] = useApproveStaffMutation();
  const [rejectStaff] = useRejectStaffMutation();

  //   handle approve staff
  const handleApproveStaff = async (staffId: string) => {
    if (processingStaff) return;

    setProcessingStaff({ id: staffId, action: "approve" });

    try {
      console.log(staffId);
      const result = await approveStaff(staffId as string).unwrap();

      if (result?.success) {
        toast.success(result?.message || "Staff approved successfully!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMessage =
        error?.data?.message || error?.message || "Failed to approve staff";
      toast.error(errMessage);
    } finally {
      setProcessingStaff(null);
    }
  };

  //   handle reject staff
  const handleRejectStaff = async (staffId: string) => {
    if (processingStaff) return;

    setProcessingStaff({ id: staffId, action: "reject" });

    try {
      const result = await rejectStaff(staffId as string).unwrap();

      if (result?.success) {
        toast.success(result?.message || "Staff rejected successfully!");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMessage =
        error?.data?.message || error?.message || "Failed to reject staff";
      toast.error(errMessage);
    } finally {
      setProcessingStaff(null);
    }
  };

  // Show error state
  if (isError) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-red-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Icons.AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Failed to load staff
        </h3>
        <p className="text-gray-500 mb-6 max-w-md">
          There was an error fetching the pending verification list. This could
          be due to a network issue or an invalid page request.
        </p>
        <Button
          onClick={() => {
            setPage(1);
            refetch();
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Return to First Page
        </Button>
      </div>
    );
  }

  // Show skeleton loading state
  if (isLoading || (isFetching && !pendingStaffs)) {
    return <SkeletonLoading />;
  }

  const list = pendingStaffs?.data?.data ?? [];
  const meta = pendingStaffs?.data?.meta;

  return (
    <div className="mt-10 bg-gray-50">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Staff Verification
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Review and approve pending service providers.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="bg-[#FFF7ED] border border-[#9F2D00] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 lg:mb-10">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base sm:text-lg text-[#9F2D00]">
              {meta?.total || 0} pending verification
              {(meta?.total || 0) !== 1 ? "s" : ""}
            </h2>
            <span className="text-sm sm:text-base text-[#9F2D00]">
              to review.
            </span>
          </div>
        </div>

        {/* Empty State */}
        {list.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 sm:p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Icons.IoCheckmarkCircleSharp className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                There are no pending staff verifications at the moment.
              </p>
            </div>
          </div>
        ) : (
          /* Staff Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {list.map((staff: IPendingUser) => {
              const isCurrentStaffProcessing = processingStaff?.id === staff.id;
              const isApproving =
                isCurrentStaffProcessing &&
                processingStaff?.action === "approve";
              const isRejecting =
                isCurrentStaffProcessing &&
                processingStaff?.action === "reject";
              const isAnyActionPending = !!processingStaff;

              return (
                <div
                  key={staff.id}
                  className="bg-white rounded-lg border border-gray-100"
                >
                  <div className="p-4 sm:p-5">
                    {/* Profile Section */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      {/* Profile Image */}
                      <div className="shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={
                              staff.profileImage || "/placeholder/avatar2.jpg"
                            }
                            alt={`${staff.firstName} ${staff.lastName}`}
                            width={80}
                            height={80}
                            draggable={false}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                          {staff.firstName} {staff.lastName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
                          {staff.email}
                        </p>
                      </div>

                      {/* View Details Icon Button */}
                      <button
                        onClick={() => {
                          setSelectedUser(staff);
                          setIsModalOpen(true);
                        }}
                        className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Icons.Eye className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {/* Approve Button */}
                      <Button
                        disabled={isAnyActionPending}
                        onClick={() => handleApproveStaff(staff.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 border hover:cursor-pointer border-green-600 rounded-md bg-transparent hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        {isApproving ? (
                          <>
                            <span className="animate-spin w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Icons.IoCheckmarkCircleSharp className="w-4 h-4" />
                            <span>Approve</span>
                          </>
                        )}
                      </Button>

                      {/* Reject Button with Confirmation Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={isAnyActionPending}
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border hover:cursor-pointer border-red-600 rounded-md bg-transparent hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                          >
                            {isRejecting ? (
                              <>
                                <span className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full" />
                                <span>Rejecting...</span>
                              </>
                            ) : (
                              <>
                                <Icons.IoCheckmarkCircleSharp className="w-4 h-4" />
                                <span>Reject</span>
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will reject the
                              verification request for{" "}
                              <span className="font-semibold text-gray-900">
                                {staff.firstName} {staff.lastName}
                              </span>
                              .
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={isRejecting}
                              className="hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isRejecting}
                              onClick={() => handleRejectStaff(staff.id)}
                              className="bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                            >
                              {isRejecting ? (
                                <span className="flex items-center gap-2">
                                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                  Rejecting...
                                </span>
                              ) : (
                                "Yes, Reject!"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPage > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPage}
              totalItems={meta.total}
              itemsPerPage={meta.limit}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Pending User Modal */}
      <PendingUserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={selectedUser}
      />
    </div>
  );
};

export default Verification;
