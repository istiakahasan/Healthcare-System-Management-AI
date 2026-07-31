import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

import useAuth from "@/hooks/useAuth";
import { useGetRecentShiftsQuery } from "@/redux/api/shifts/shiftsApi";
import { IShift } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import StatusMaker from "@/utils/StatusMaker";
import { parseISO } from "date-fns";
import { Pagination } from "../../pagination";
const PersonCell: React.FC<{
  name?: string;
  email?: string;
  avatarUrl?: string;
}> = ({ name = "—", email = "", avatarUrl = "" }) => {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{initials || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-semibold text-slate-900 truncate">
          {name}
        </span>
        {email ? (
          <span className="text-xs text-slate-500 truncate">{email}</span>
        ) : null}
      </div>
    </div>
  );
};
const RecentShiftTable = () => {
  const isAuthenticated = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: recentShifts, isLoading: isRecentShiftsLoading } =
    useGetRecentShiftsQuery(
      { page, limit },
      {
        skip: !isAuthenticated,
      },
    );

  //   console.log(recentShifts);

  if (isRecentShiftsLoading) {
    return (
      <div className="p-4">
        <div className="rounded-lg bg-white shadow-sm p-6 text-center">
          <p className="text-sm text-slate-500">Loading recent shifts...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <div className="rounded-lg bg-white  overflow-hidden">
        <h2 className="text-2xl font-semibold p-4">All recent shifts</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-amber-500 text-white">
              <TableHead className="w-[100px] text-white">Staff</TableHead>
              <TableHead className="text-white">Client</TableHead>
              <TableHead className="text-white">Service Category</TableHead>
              <TableHead className="text-center text-white">Date</TableHead>
              <TableHead className="text-right text-white">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {recentShifts?.data?.map((shift: IShift) => (
              <TableRow key={shift?.id}>
                <TableCell>
                  <PersonCell
                    name={`${shift?.staff?.firstName} ${shift?.staff?.lastName}`}
                    email={shift?.staff?.email}
                    avatarUrl={shift?.staff?.profileImage || ""}
                  />
                </TableCell>

                <TableCell>
                  {shift?.customer?.firstName} {shift?.customer?.lastName}
                </TableCell>

                <TableCell>
                  {formatStatusText(shift?.serviceCategory.join(", "))}
                </TableCell>

                <TableCell className="text-center">
                  {parseISO(shift?.createdAt).toDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <StatusMaker statusName={shift?.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {recentShifts?.meta && (
          <div className="p-4 border-t">
            <Pagination
              currentPage={recentShifts.meta.page}
              totalPages={recentShifts.meta.totalPage}
              totalItems={recentShifts.meta.total}
              itemsPerPage={recentShifts.meta.limit}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentShiftTable;
