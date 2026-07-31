import baseApi from "../baseApi";

const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviews: builder.query({
      query: () => "staff/review",
      providesTags: ["Reviews"],
    }),
  }),
});

export const { useGetAllReviewsQuery } = reviewsApi;
