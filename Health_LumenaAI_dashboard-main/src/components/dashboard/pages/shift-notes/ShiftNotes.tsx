/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetCustomerShiftNotesQuery,
  useGetShiftNoteDetailsQuery,
  useUpdateShiftNoteStatusMutation,
} from "@/redux/api/shiftNote/shiftNoteApi";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ShiftNotesCustomer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useGetCustomerShiftNotesQuery({
    page: currentPage,
    limit: 10,
    searchTerm: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  // console.log("Customer Shift Notes", data);

  const { data: reportDetails, isLoading: isDetailsLoading } =
    useGetShiftNoteDetailsQuery(selectedReportId as string, {
      skip: !selectedReportId,
    });

  useEffect(() => {
    if (reportDetails?.data?.adminNote) {
      setAdminNote(reportDetails.data.adminNote);
    }
  }, [reportDetails?.data?.adminNote]);

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateShiftNoteStatusMutation();

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedReportId) return;
    setPendingAction(status);
    try {
      const res = await updateStatus({
        id: selectedReportId,
        status,
        adminNote: adminNote,
      }).unwrap();
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        setIsModalOpen(false);
        setAdminNote("");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    } finally {
      setPendingAction(null);
    }
  };

  const reports = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handleOpenDetails = (id: string) => {
    setSelectedReportId(id);
    setAdminNote("");
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return (
          <Badge className="bg-[#E7F6EC] text-[#0D894F] hover:bg-[#E7F6EC] border-none px-3 py-1">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-[#FEF6E7] text-[#D4A017] hover:bg-[#FEF6E7] border-none px-3 py-1">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#101828]">
          All Shift Notes
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EAECF0] overflow-hidden">
        <div className="p-5 border-b border-[#EAECF0]">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-[#D0D5DD] rounded-lg focus:ring-[#F97316] focus:border-[#F97316]"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] h-10 border-[#D0D5DD] rounded-lg text-[#344054]">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F5C542]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[#854D0E] font-medium py-4 px-6 rounded-tl-lg">
                  Customer and Staff
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Date
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Summary Snippet
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Status
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6 rounded-tr-lg">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-10 w-40" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-60" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-[#667085]"
                  >
                    No reports found.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report: any) => (
                  <TableRow
                    key={report.id}
                    className="border-b border-[#EAECF0] hover:bg-[#F9FAFB]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-[#EAECF0]">
                          <AvatarImage src={report.staff.profileImage} />
                          <AvatarFallback>
                            {report.staff.firstName[0]}
                            {report.staff.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#101828]">
                            {report.staff.firstName} {report.staff.lastName}
                          </span>
                          <span className="text-xs text-[#667085]">
                            {report.staff.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-[#475467]">
                      {report.createdAt}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-[#475467] line-clamp-1 max-w-[300px]">
                        {report.aiSummary}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetails(report.id)}
                        className="text-[#F5C542] text-sm font-semibold hover:underline flex items-center gap-1"
                      >
                        View Details
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-5 flex items-center justify-between border-t border-[#EAECF0] bg-white text-sm text-[#475467]">
          <div>
            Showing {reports.length} out of {meta?.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 gap-2 border-[#D0D5DD] text-[#344054]"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta?.totalPages || 1 }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 p-0 rounded-lg ${
                    currentPage === i + 1
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "text-[#667085] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === meta?.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 gap-2 border-[#D0D5DD] text-[#344054]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setAdminNote("");
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none">
          <DialogHeader className="p-6 border-b border-[#EAECF0] flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#101828]">
              Shift Note Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {isDetailsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : reportDetails?.data ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Staff&apos;s Raw Report
                  </h3>
                  <div className="p-4 bg-[#F9FAFB] rounded-xl text-sm text-[#475467] leading-relaxed border border-[#EAECF0]">
                    {reportDetails.data.rawNotes}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    AI Summary
                  </h3>
                  <div className="p-4 bg-[#EFF6FF] rounded-xl text-sm text-[#1E40AF] leading-relaxed border border-[#DBEAFE]">
                    {reportDetails.data.aiSummary}
                  </div>
                </div>

                {/* Backend developer need to add this */}
                {/* <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    AI Image Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-video bg-[#F3F4F6] rounded-xl overflow-hidden border border-[#EAECF0]">
                      {reportDetails.data.image ? (
                        <Image
                          src={reportDetails.data.image}
                          alt="Report image"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#9CA3AF]">
                          <Eye className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-[#EFF6FF] rounded-xl text-sm text-[#1E40AF] leading-relaxed border border-[#DBEAFE]">
                      {reportDetails.data.aiImageSummary ||
                        "No image summary available."}
                    </div>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Admin Note
                  </h3>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add your admin note here..."
                    className="p-4 bg-[#EFF6FF] rounded-xl text-sm text-[#1E40AF] leading-relaxed border border-[#DBEAFE] focus:ring-[#F97316] focus:border-[#F97316] resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-[#EAECF0]">
                  {reportDetails.data.status !== "PENDING" ? (
                    <div className="w-full p-4 rounded-xl bg-[#F3F4F6] text-center">
                      <p className="text-sm font-semibold text-[#475467]">
                        This shift note is already{" "}
                        <span className="text-[#101828]">
                          {reportDetails.data.status?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleUpdateStatus("APPROVED")}
                        disabled={isUpdating}
                        className="cursor-pointer flex-1 bg-[#28A745] hover:bg-[#059669] text-white rounded-md h-12 font-semibold transition-all active:scale-[0.98] shadow-sm shadow-[#10B981]/20 border-none"
                      >
                        {pendingAction === "APPROVED" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Approve"
                        )}
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={isUpdating}
                        className="cursor-pointer flex-1 bg-[#FEE2E2] hover:bg-[#FCA5A5] text-[#EF4444] rounded-md h-12 font-semibold transition-all active:scale-[0.98] border-none"
                      >
                        {pendingAction === "REJECTED" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Reject"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-[#667085]">
                Failed to load details.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftNotesCustomer;
