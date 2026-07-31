import { IDashboardStatsResponse } from "@/types/global";
import baseApi from "../baseApi";

const adminDashboardStatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<IDashboardStatsResponse, void>({
      query: () => "/admin/admin-dashboard-stats",
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = adminDashboardStatsApi;
