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
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IShift } from "@/types/global";
import { Icons } from "@/utils/icons";
import StatusMaker from "@/utils/StatusMaker";
import { parseISO } from "date-fns";

interface ShiftsTableProps {
  shifts: IShift[];
  onView: (booking: IShift) => void;
  isLoading?: boolean;
  handleDeleteShift: (shiftId: string) => void;
}

export const ShiftsTable = ({
  shifts,
  onView,
  handleDeleteShift,

  isLoading,
}: ShiftsTableProps) => {
  return (
    <>
      <Card className="rounded-2xl border border-slate-200 py-0 overflow-hidden">
        <CardContent className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary text-white">
                <TableRow className="hover:bg-yellow-500">
                  <TableHead className="text-white font-semibold">
                    Shift Id
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Client
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Staff
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Service
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-white font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-white font-semibold">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-24 text-center text-slate-500"
                    >
                      Loading shifts
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  shifts?.map((s: IShift) => (
                    <TableRow
                      key={s?.id}
                      className="border-b last:border-0 hover:bg-slate-50"
                    >
                      {/* Shift ID */}
                      <TableCell className="py-3">
                        <p>{s?.id ?? "-"}</p>
                      </TableCell>
                      {/* Customer/Client Name */}
                      <TableCell className="py-3 text-slate-700">
                        {`${s?.customer?.firstName ?? ""} ${
                          s?.customer?.lastName ?? "-"
                        }`}
                      </TableCell>
                      {/* Staff/Provider Name */}
                      <TableCell className="py-3 text-slate-700 capitalize">
                        {s?.staff?.firstName ?? ""} {s?.staff?.lastName ?? "-"}
                      </TableCell>
                      {/* Service/ Category */}
                      <TableCell className="py-3 capitalize">
                        {s?.serviceCategory
                          ?.join(", ")
                          .split("_")
                          .join(" ")
                          .toLowerCase() || "—"}
                      </TableCell>
                      {/* Date */}
                      <TableCell className="py-3 text-slate-700">
                        {parseISO(s?.createdAt).toDateString()}
                      </TableCell>
                      <TableCell className="py-3 text-slate-700">
                        {StatusMaker({ statusName: s?.status ?? "" })}
                      </TableCell>
                      {/* Status */}
                      <TableCell className="flex items-center gap-1 py-3 justify-end">
                        {/* View */}
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View"
                          className="bg-blue-100 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-200 hover:cursor-pointer"
                          type="button"
                          onClick={() => onView(s)}
                        >
                          <Icons.Eye className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete"
                              className="bg-red-100 rounded-md text-red-600 hover:text-red-700 hover:bg-red-200 hover:cursor-pointer"
                              type="button"
                            >
                              <Icons.RiDeleteBinLine className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete this shift.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:cursor-pointer">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteShift(s?.id)}
                                className="bg-red-500 hover:bg-red-600 hover:cursor-pointer"
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && shifts?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="h-24 text-center text-slate-500"
                    >
                      <div className="flex gap-2 items-center justify-center">
                        <Icons.TbCalendarMonth className="h-5 w-5" />
                        <span>No shifts found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
