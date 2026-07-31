import { ICarePlanResponse } from "@/types/global";
import baseApi from "../baseApi";
export type GetAllCarePlanArgs = {
  page?: number;
  limit?: number;
  status?: string;
};
const carePlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCarePlan: builder.query<ICarePlanResponse, GetAllCarePlanArgs | void>(
      {
        query: (args) => {
          const { page = 1, limit = 10, status } = args || {};

          const params: Record<string, string | number | boolean> = {
            page,
            limit,
          };

          // inject status if available
          if (status) params.status = status;

          return {
            url: "/carePlan/get-all",
            params,
          };
        },
        providesTags: ["CarePlans"],
      }
    ),
    deleteCarePlan: builder.mutation({
      query: (carePlanId: string) => ({
        url: `/carePlan/delete/${carePlanId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarePlans"],
    }),
  }),
});

export const { useGetAllCarePlanQuery, useDeleteCarePlanMutation } =
  carePlanApi;
