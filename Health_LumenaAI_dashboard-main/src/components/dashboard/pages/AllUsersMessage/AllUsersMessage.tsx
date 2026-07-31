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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllContactSupportQuery } from "@/redux/api/contactSupport/contactSupportApi";
import { IContactSupport } from "@/types/global";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const AllUsersMessage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] =
    useState<IContactSupport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useGetAllContactSupportQuery({
    page: currentPage,
    limit: 10,
    searchTerm: debouncedSearch || undefined,
  });

  const messages = data?.data?.data || [];
  const meta = data?.data?.meta;

  const handleOpenDetails = (message: IContactSupport) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getCategoryBadge = (category: string) => {
    const cat = category.toUpperCase();
    switch (cat) {
      case "ACCOUNT":
        return (
          <Badge className="bg-[#E7F6EC] text-[#0D894F] hover:bg-[#E7F6EC] border-none px-3 py-1 capitalize">
            {category}
          </Badge>
        );
      case "PAYMENT":
        return (
          <Badge className="bg-[#FEF6E7] text-[#D4A017] hover:bg-[#FEF6E7] border-none px-3 py-1 capitalize">
            {category}
          </Badge>
        );
      case "SCHEDULE":
        return (
          <Badge className="bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#EFF6FF] border-none px-3 py-1 capitalize">
            {category}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#F9FAFB] text-[#475467] hover:bg-[#F9FAFB] border-none px-3 py-1 capitalize">
            {category}
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#101828]">
          All User Messages
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F5C542]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[#854D0E] font-medium py-4 px-6 rounded-tl-lg">
                  User
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Date
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Summary Snippet
                </TableHead>
                <TableHead className="text-[#854D0E] font-medium py-4 px-6">
                  Category
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
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-[#667085]"
                  >
                    No messages found.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((message: IContactSupport) => (
                  <TableRow
                    key={message.id}
                    className="border-b border-[#EAECF0] hover:bg-[#F9FAFB]"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-[#EAECF0]">
                          <AvatarImage src={message.user.profileImage || ""} />
                          <AvatarFallback>
                            {message.user.firstName[0]}
                            {message.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-[#101828]">
                            {message.user.firstName} {message.user.lastName}
                          </span>
                          <span className="text-xs text-[#667085]">
                            {message.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-[#475467]">
                      {formatDate(message.createdAt)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <p className="text-sm text-[#475467] line-clamp-1 max-w-[300px]">
                        {message.subject}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getCategoryBadge(message.category)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <button
                        onClick={() => handleOpenDetails(message)}
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
            Showing {messages.length} out of {meta?.total || 0}
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
                      ? "bg-[#F5C542] text-white hover:bg-[#E5B532]"
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none">
          <DialogHeader className="p-6 border-b border-[#EAECF0]">
            <DialogTitle className="text-xl font-semibold text-[#101828]">
              Message Details
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {selectedMessage && (
              <>
                <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#EAECF0]">
                  <Avatar className="w-12 h-12 border border-[#EAECF0]">
                    <AvatarImage
                      src={selectedMessage.user.profileImage || ""}
                    />
                    <AvatarFallback>
                      {selectedMessage.user.firstName[0]}
                      {selectedMessage.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-[#101828]">
                      {selectedMessage.user.firstName}{" "}
                      {selectedMessage.user.lastName}
                    </span>
                    <span className="text-sm text-[#667085]">
                      {selectedMessage.user.email}
                    </span>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    {getCategoryBadge(selectedMessage.category)}
                    <span className="text-xs text-[#667085]">
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Subject
                  </h3>
                  <div className="p-4 bg-white rounded-xl text-sm text-[#475467] leading-relaxed border border-[#EAECF0]">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#101828]">
                    Message
                  </h3>
                  <div className="p-4 bg-white rounded-xl text-sm text-[#475467] leading-relaxed border border-[#EAECF0]">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.image && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#101828]">
                      Attached Image
                    </h3>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#EAECF0]">
                      <Image
                        src={selectedMessage.image}
                        alt="Message attachment"
                        fill
                        unoptimized
                        className="object-contain bg-black/5"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllUsersMessage;
