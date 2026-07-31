import {
  IRecentShiftsResponse,
  IShiftsResponse,
  IShiftsStatsResponse,
  IStaffShiftNoteResponse,
  IBaseResponse,
} from "@/types/global";
import baseApi from "../baseApi";
type GetAllShiftsArgs = {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
};

const shiftsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRecentShifts: builder.query<IRecentShiftsResponse, { page?: number; limit?: number } | void>({
      query: (args) => {
        const { page = 1, limit = 10 } = args || {};
        return {
          url: "/admin/recent-shifts",
          params: { page, limit },
        };
      },
      providesTags: ["RecentShifts"],
    }),

    getAllShifts: builder.query<IShiftsResponse, GetAllShiftsArgs | void>({
      query: (args) => {
        const { page = 1, limit = 10, status, searchTerm } = args || {};

        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };

        // inject status and searchTerm if available in the params
        if (status) params.status = status;
        if (searchTerm) params.searchTerm = searchTerm;

        return { url: "/admin/all-shifts", params };
      },
      providesTags: ["AllShifts"],
    }),
    getShiftsStats: builder.query<IShiftsStatsResponse, void>({
      query: () => "/admin/shift-overview",
      providesTags: ["ShiftsStats"],
    }),
    getShiftNotes: builder.query<IStaffShiftNoteResponse, GetAllShiftsArgs | void>({
      query: (args) => {
        const { page = 1, limit = 10, status, searchTerm } = args || {};

        const params: Record<string, string | number | boolean> = {
          page,
          limit,
        };

        if (status) params.status = status;
        if (searchTerm) params.searchTerm = searchTerm;

        return { url: "/shift-note", params };
      },
      providesTags: ["RecentShifts"], // Reusing RecentShifts OR should I add a new tag?
    }),
    deleteShift: builder.mutation<IBaseResponse, string>({
      query: (id) => ({
        url: `/admin/all-shifts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllShifts", "ShiftsStats", "RecentShifts"],
    }),
  }),
});

export const {
  useGetRecentShiftsQuery,
  useGetAllShiftsQuery,
  useGetShiftsStatsQuery,
  useGetShiftNotesQuery,
  useDeleteShiftMutation,
} = shiftsApi;
