import {
  IBlockUserPayload,
  IBlockUserResponse,
  IUnblockUserPayload,
  IUnblockUserResponse,
  IUsersResponse,
  IUsersStatsResponse,
} from "@/types/global";
import baseApi from "../baseApi";
export type GetAllUsersArgs = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  role?: string;
};

const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // get users stats
    getUsersStats: build.query<IUsersStatsResponse, void>({
      query: () => "/admin/admin-dashboard-stats/users",
      providesTags: ["UsersStats"],
    }),

    // get all users + server pagination  + filter
    getAllUsers: build.query<IUsersResponse, GetAllUsersArgs | void>({
      query: (args) => {
        const {
          page = 1,
          limit = 10,
          searchTerm,
          status,
          role,
        } = args || {};

        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };

        // inject other params in main params
        if (searchTerm && searchTerm.trim() !== "")
          params.searchTerm = searchTerm;
        if (status) params.status = status;
        if (role && role.trim() !== "") params.role = role;

        // return the actual params
        return { url: "/users/get-all-users", params };
      },
      providesTags: ["Users"],
    }),

    // delete user
    deleteUser: build.mutation({
      query: (userId: string) => ({
        url: `/users/delete-user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users", "AllShifts", "RecentShifts", "UsersStats"],
    }),
    // block user
    blockUser: build.mutation<IBlockUserResponse, IBlockUserPayload>({
      query: ({ userId }) => ({
        url: `/users/block/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "AllShifts", "RecentShifts", "UsersStats"],
    }),
    // unblock user
    unblockUser: build.mutation<IUnblockUserResponse, IUnblockUserPayload>({
      query: ({ userId }) => ({
        url: `/users/unblock/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Users", "AllShifts", "RecentShifts", "UsersStats"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUsersStatsQuery,
  useDeleteUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} = usersApi;
