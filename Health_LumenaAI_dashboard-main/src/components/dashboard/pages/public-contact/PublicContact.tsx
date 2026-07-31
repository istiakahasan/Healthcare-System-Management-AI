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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeletePublicContactSupportMutation,
  useGetAllPublicContactQuery,
  useLazyGetSinglePublicContactSupportQuery,
} from "@/redux/api/contactSupport/contactSupportApi";
import { IPublicContact } from "@/types/global";
import { Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Pagination } from "../../pagination";

const PAGE_SIZE = 10;

const PublicContact = () => {
  const [page, setPage] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    data: listResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllPublicContactQuery({ page, limit: PAGE_SIZE });

  const [
    getSingleContact,
    { data: singleResponse, isFetching: isSingleLoading },
  ] = useLazyGetSinglePublicContactSupportQuery();
  const [deleteContact, { isLoading: isDeleting }] =
    useDeletePublicContactSupportMutation();

  const messages = listResponse?.data || [];
  const meta = listResponse?.meta;
  const selectedMessage = singleResponse?.data || null;
  const totalPages = meta?.totalPages || meta?.totalPage || 1;

  const handleOpenDetails = async (id: string) => {
    setSelectedId(id);
    setIsDetailsOpen(true);
    await getSingleContact(id);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteContact(id).unwrap();
      if (result?.success) {
        toast.success(result.message || "Message deleted successfully");
      } else {
        toast.success("Message deleted successfully");
      }
      setDeleteId(null);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(
        err?.data?.message || err?.message || "Failed to delete message",
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#101828]">
          Public Contacts
        </h1>
        <p className="text-sm text-[#667085]">
          Messages submitted from the public contact page.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#EAECF0] overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FFF7ED]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[#9A3412] font-medium py-4 px-6">
                  Name
                </TableHead>
                <TableHead className="text-[#9A3412] font-medium py-4 px-6">
                  Email
                </TableHead>
                <TableHead className="text-[#9A3412] font-medium py-4 px-6">
                  Subject
                </TableHead>
                <TableHead className="text-[#9A3412] font-medium py-4 px-6">
                  Date
                </TableHead>
                <TableHead className="text-[#9A3412] font-medium py-4 px-6 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-10 w-44" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-[#667085]"
                  >
                    No public messages found.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((item: IPublicContact) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-[#EAECF0] hover:bg-[#F9FAFB]"
                  >
                    <TableCell className="px-6 py-4 text-sm font-medium text-[#101828] max-w-[220px]">
                      <p className="truncate">{item.name}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-[#475467] max-w-[260px]">
                      <p className="truncate">{item.email}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-[#475467] max-w-[280px]">
                      <p className="truncate">{item.subject}</p>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-[#475467]">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5"
                          onClick={() => handleOpenDetails(item.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-red-600 hover:text-red-700"
                          disabled={isDeleting}
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden p-4 space-y-3">
          {isLoading || isFetching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#EAECF0] p-4 space-y-3"
              >
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            ))
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D0D5DD] py-10 text-center text-sm text-[#667085]">
              No public messages found.
            </div>
          ) : (
            messages.map((item: IPublicContact) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#EAECF0] p-4 space-y-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#101828] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#667085] truncate">
                    {item.email}
                  </p>
                </div>

                <p className="text-sm text-[#475467] line-clamp-2">
                  {item.subject}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#667085]">
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(item.id)}
                    className="h-9"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setDeleteId(item.id)}
                    className="h-9 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 sm:px-5 border-t border-[#EAECF0]">
          <Pagination
            currentPage={meta?.page || page}
            totalPages={totalPages}
            totalItems={meta?.total || messages.length}
            itemsPerPage={meta?.limit || PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>Failed to load public contacts.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none">
          <DialogHeader className="p-5 sm:p-6 border-b border-[#EAECF0]">
            <DialogTitle className="text-lg sm:text-xl font-semibold text-[#101828]">
              Message Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {isSingleLoading ||
            !selectedMessage ||
            selectedMessage.id !== selectedId ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#EAECF0] space-y-1">
                  <p className="text-base font-semibold text-[#101828] truncate">
                    {selectedMessage.name}
                  </p>
                  <p className="text-sm text-[#667085] truncate">
                    {selectedMessage.email}
                  </p>
                  <div className="text-xs text-[#667085]">
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Subject
                  </h3>
                  <div className="p-4 rounded-xl border border-[#EAECF0] text-sm text-[#475467]">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Message
                  </h3>
                  <div className="p-4 rounded-xl border border-[#EAECF0] text-sm text-[#475467] leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected public contact message
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="hover:cursor-pointer"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting || !deleteId}
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white hover:cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublicContact;
