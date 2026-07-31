import { IBaseResponse, IStaffShiftNote } from "@/types/global";
import baseApi from "../baseApi";

export type IShiftNoteDetailsResponse = IBaseResponse<IStaffShiftNote>;

export const shiftNoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerShiftNotes: builder.query<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      { page?: number; limit?: number; searchTerm?: string; status?: string }
    >({
      query: (params) => ({
        url: "/shift-note",
        params,
      }),
      providesTags: ["RecentShifts"],
    }),
    getShiftNoteDetails: builder.query<IShiftNoteDetailsResponse, string>({
      query: (id) => `/shift-note/${id}`,
      providesTags: (result, error, id) => [{ type: "RecentShifts", id }],
    }),
    updateShiftNoteStatus: builder.mutation<
      IBaseResponse,
      {
        id: string;
        status: "APPROVED" | "REJECTED" | "PENDING";
        adminNote: string;
      }
    >({
      query: ({ id, status, adminNote }) => ({
        url: `/shift-note/${id}`,
        method: "PATCH",
        body: { status, adminNote },
      }),
      invalidatesTags: (result, error, { id }) => [
        "RecentShifts",
        { type: "RecentShifts", id },
      ],
    }),
  }),
});

export const {
  useGetCustomerShiftNotesQuery,
  useGetShiftNoteDetailsQuery,
  useUpdateShiftNoteStatusMutation,
} = shiftNoteApi;

export default shiftNoteApi;
