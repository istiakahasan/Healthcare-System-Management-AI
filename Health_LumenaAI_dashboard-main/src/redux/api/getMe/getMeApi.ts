import { setUser } from "@/redux/features/user/authSlice";
import { IGetProfileResponse } from "@/types/global";
import baseApi from "../baseApi";

const getMeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<IGetProfileResponse, void>({
      query: () => "/users/my-profile",
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data?.data ?? null));
        } catch {
          // no-op: keep previous user state when getMe fails
        }
      },
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery } = getMeApi;
