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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { IUser, IUserStatus } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { parseISO } from "date-fns";

export function UsersTable({
  users,
  isLoading,
  handleDeleteUser,
  handleBlockUser,
  handleUnblockUser,
  isDeleteUserLoading,
  isBlockUserLoading,
  isUnblockUserLoading,

  onView,
}: {
  users: IUser[];
  isLoading?: boolean;
  handleDeleteUser: (userId: string) => void;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  isDeleteUserLoading?: boolean;
  isBlockUserLoading?: boolean;
  isUnblockUserLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onView: (booking: any) => void;
}) {
  return (
    <Card className="rounded-2xl shadow-sm border border-slate-200 py-0 overflow-hidden">
      <CardContent className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-primary text-white">
              <TableRow className="hover:bg-yellow-500">
                <TableHead className="text-white font-semibold">Name</TableHead>
                <TableHead className="text-white font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-white font-semibold">Role</TableHead>
                <TableHead className="text-white font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-white font-semibold">
                  Joined
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
                    Loading users…
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                users?.map((u: IUser) => (
                  <TableRow
                    key={u.id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                          <AvatarImage
                            src={u.profileImage ?? undefined}
                            alt={u?.firstName ?? "User"}
                          />
                          <AvatarFallback className="text-xs">
                            {(u?.firstName?.[0] ?? "?").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-800">
                          {u?.firstName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-slate-700">
                      {u.email}
                    </TableCell>
                    <TableCell className="py-3 text-slate-700 capitalize">
                      {formatStatusText(u.role)}
                    </TableCell>
                    <TableCell className="py-3">
                      {(() => {
                        const s = (u.status ?? "").toLowerCase();
                        if (s === "active")
                          return (
                            <Badge className="bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs">
                              Active
                            </Badge>
                          );
                        if (s === "inactive")
                          return (
                            <Badge className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs">
                              Inactive
                            </Badge>
                          );
                        return (
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-xs">
                            {u.status}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-3 text-slate-700">
                      {parseISO(u?.createdAt).toDateString()}
                    </TableCell>
                    <TableCell className="flex items-center gap-1 py-3 justify-end">
                      {/* View */}
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View"
                        className="bg-blue-100 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-200 hover:cursor-pointer"
                        type="button"
                        onClick={() => onView(u)}
                      >
                        <Icons.Eye className="h-4 w-4" />
                      </Button>
                      {/* Block */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={
                              isBlockUserLoading || isUnblockUserLoading
                            }
                            variant="ghost"
                            size="sm"
                            title={
                              u?.status === IUserStatus.ACTIVE
                                ? "Block"
                                : "Unblock"
                            }
                            className="bg-yellow-200 rounded-md text-yellow-600 hover:text-yellow-700 hover:bg-yellow-200 hover:cursor-pointer"
                            type="button"
                          >
                            {u?.status === IUserStatus.ACTIVE ? (
                              <Icons.MdBlock className="h-4 w-4" />
                            ) : (
                              <Icons.CgUnblock className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will block this user, you can unblock them
                              later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer">
                              Cancel
                            </AlertDialogCancel>
                            {u?.status === IUserStatus.ACTIVE ? (
                              <AlertDialogAction
                                onClick={() => handleBlockUser(u?.id)}
                                className="bg-yellow-700 text-white hover:bg-yellow-800 hover:cursor-pointer transition-colors duration-300"
                              >
                                Block
                              </AlertDialogAction>
                            ) : (
                              <AlertDialogAction
                                onClick={() => handleUnblockUser(u?.id)}
                                className="bg-yellow-700 text-white hover:bg-yellow-800 hover:cursor-pointer transition-colors duration-300"
                              >
                                Unblock
                              </AlertDialogAction>
                            )}
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={isDeleteUserLoading}
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
                              permanently delete this user.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="hover:cursor-pointer">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(u?.id)}
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

              {!isLoading && users?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="h-24 text-center text-slate-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
