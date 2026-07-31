import { ITopRatedStaffResponse } from "@/types/global";
import baseApi from "../baseApi";

const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopRatedStaff: builder.query<ITopRatedStaffResponse, void>({
      query: () => ({
        url: "/staff/top-staff",
      }),
      providesTags: ["TopRatedStaff"],
    }),

    //  get unverified staff
    getUnverifiedStaff: builder.query({
      query: () => "/staff/unverified-staff",
      providesTags: ["UnverifiedStaff"],
    }),
  }),
});

export const { useGetTopRatedStaffQuery, useGetUnverifiedStaffQuery } =
  staffApi;
