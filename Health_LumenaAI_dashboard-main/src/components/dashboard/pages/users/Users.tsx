"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import useAuth from "@/hooks/useAuth";
import { Modal } from "./modal";

import StatsCard from "@/components/shared/StatsCard";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useBlockUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useGetUsersStatsQuery,
  useUnblockUserMutation,
} from "@/redux/api/users/usersApi";
import { IUser } from "@/types/global";
import { Icons } from "@/utils/icons";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { toast } from "sonner";
import { CustomDropdown } from "../../../shared/CustomDropdown";
import { Pagination } from "../../pagination";
import { UsersTable } from "./usersTable";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
];

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "CUSTOMER", label: "CUSTOMER" },
  { value: "STAFF", label: "STAFF" },
];

export default function UsersPage() {
  //   const pathname = usePathname();
  //   const router = useRouter();
  const sp = useSearchParams();
  const isAuthenticated = useAuth();

  const setParams = useSetParamsForPagination();

  // URL state
  const urlPage = Number(sp.get("page") || 1);
  const urlLimit = Number(sp.get("limit") || 10);
  const searchTerm = sp.get("searchTerm") || "";
  const status = sp.get("status") || "";
  const role = sp.get("role") || "";

  // local UI state
  const [searchTermQuery, setSearchTermQuery] = useState(searchTerm);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // helper to patch URL params
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
    // value: "", "ACTIVE", "BLOCKED"
    setParams({ status: value || null, page: 1 });
  };

  const handleRoleChange = (value: string) => {
    // value: "", "Customer", "Staff"
    setParams({ role: value || null });
  };

  // queries
  const { data: users, isLoading } = useGetAllUsersQuery(
    isAuthenticated
      ? { page: urlPage, limit: urlLimit, searchTerm, status, role }
      : undefined,
    { skip: !isAuthenticated }
  );

  // get user stats
  const { data: usersStats, isLoading: isUsersStatsLoading } =
    useGetUsersStatsQuery(undefined, { skip: !isAuthenticated });

  // delete user
  const [deleteUser, { isLoading: isDeleteUserLoading }] =
    useDeleteUserMutation();

  // block user

  const [blockUser, { isLoading: isBlockUserLoading }] = useBlockUserMutation();

  // unblock user

  const [unblockUser, { isLoading: isUnblockUserLoading }] =
    useUnblockUserMutation();

  // meta
  const totalPages = users?.meta?.totalPage ?? 1;
  const totalItems = users?.meta?.total ?? 0;
  const page = users?.meta?.page ?? urlPage;
  const limit = users?.meta?.limit ?? urlLimit;

  // values for dropdowns (controlled by URL)
  const statusFilterValue = sp.get("status") || "";
  const roleFilterValue = sp.get("role") || "";

  const handleBlockUser = async (userId: string) => {
    try {
      const result = await blockUser({ userId }).unwrap();
      if (result?.success) {
        toast.success(result?.message);
      }
      //   eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Something went wrong!");
      //   console.log(error);
    }

    // console.log("block user", userId);
  };

  //   unblock user
  const handleUnblockUser = async (userId: string) => {
    // console.log(userId);

    try {
      const result = await unblockUser({ userId }).unwrap();
      if (result?.success) {
        toast.success(result?.message);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //   console.log(error);
      toast.error("Something went wrong!");
    }
  };

  //   handle delete user
  const handleDeleteUser = async (userId: string) => {
    console.log("delete user", userId);

    try {
      await deleteUser(userId).unwrap();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" bg-gray-50 p-4 md:p-0">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatsCard
          title="Total Registered Users"
          value={`${usersStats?.data?.totalRegisteredUser ?? 0}`}
          valueText="Active Users"
          icon={"Users"}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          isLoading={isUsersStatsLoading}
        />
        <StatsCard
          title="Active Staff"
          value={`${usersStats?.data?.activeStaff ?? 0}`}
          icon={"HiMiniUserGroup"}
          valueText="Staff"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          isLoading={isUsersStatsLoading}
        />
        <StatsCard
          title="Active Regular Customer"
          value={`${usersStats?.data?.activeClient ?? 0}`}
          valueText="Regular Customer"
          icon={"Users"}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          isLoading={isUsersStatsLoading}
        />
        <StatsCard
          title="New Sign-Ups This Week"
          value={`${usersStats?.data?.activeClient ?? 0}`}
          valueText="Users"
          icon={"RiUserAddLine"}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          isLoading={isUsersStatsLoading}
        />
      </div>

      {/* Filters + Table */}
      <div className="border shadow p-6 rounded-lg">
        <div className="md:flex items-center justify-between mb-10 space-y-6 md:space-y-0">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search users..."
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
              className="w-fit"
            />
            <CustomDropdown
              options={roleOptions}
              placeholder="All Roles"
              value={roleFilterValue}
              onChange={handleRoleChange}
              className="w-fit"
            />
          </div>
        </div>

        <UsersTable
          users={(users?.data as IUser[]) || []}
          onView={setSelectedUser}
          handleDeleteUser={handleDeleteUser}
          handleBlockUser={handleBlockUser}
          handleUnblockUser={handleUnblockUser}
          isLoading={isLoading}
          isDeleteUserLoading={isDeleteUserLoading}
          isBlockUserLoading={isBlockUserLoading}
          isUnblockUserLoading={isUnblockUserLoading}
        />
      </div>

      <Pagination
        currentPage={page}
        totalItems={totalItems}
        totalPages={totalPages}
        itemsPerPage={limit}
      />

      <Modal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
