import {
  IApproveStaffResponse,
  IPendingUserResponse,
  IRejectStaffResponse,
} from "@/types/global";
import baseApi from "../baseApi";

const verificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // get unverified staff
    getPendingStaffs: builder.query<
      IPendingUserResponse,
      { page?: number; limit?: number } | void
    >({
      query: (args) => {
        const { page = 1, limit = 10 } = args || {};
        return {
          url: "/admin/pending-users",
          params: { page, limit },
        };
      },
      providesTags: ["PendingStaffs"],
    }),

    // approve staffs
    approveStaff: builder.mutation<IApproveStaffResponse, string>({
      query: (staffId) => {
        return {
          url: `/admin/approve-staff/${staffId}`,
          method: "POST",
        };
      },
      invalidatesTags: ["PendingStaffs"],
    }),

    // reject staff
    rejectStaff: builder.mutation<IRejectStaffResponse, string>({
      query: (staffId) => {
        return {
          url: `/admin/reject-staff/${staffId}`,
          method: "POST",
        };
      },
      invalidatesTags: ["PendingStaffs"],
    }),
  }),
});

export const {
  useGetPendingStaffsQuery,
  useApproveStaffMutation,
  useRejectStaffMutation,
} = verificationApi;
