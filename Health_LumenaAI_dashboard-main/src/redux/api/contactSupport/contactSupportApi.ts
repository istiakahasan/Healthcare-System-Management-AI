import {
  IBaseResponse,
  IContactSupportResponse,
  IPublicContactResponse,
  ISinglePublicContactResponse,
} from "@/types/global";
import baseApi from "../baseApi";
// GET: {{BASE_URL}}/contact
// GET: {{BASE_URL}}/contact/:id
// DELETE: {{BASE_URL}}/contact/:id

// {
//     "name": "Afsar-4",
//     "email": "afsar1@gmail.com",
//     "subject": "Test",
//     "message": "This is for testing"
// }

export const contactSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllContactSupport: builder.query<
      IContactSupportResponse,
      { page?: number; limit?: number; searchTerm?: string; date?: string }
    >({
      query: (params) => {
        const { searchTerm, date, ...rest } = params;
        return {
          url: "/admin/all-contact-support",
          params: {
            ...rest,
            searchTerm,
            search: searchTerm,
            email: searchTerm, // Fallback for email-specific search
            date,
            createdAt: date, // Fallback for date-specific filter
          },
        };
      },
      providesTags: ["ContactSupport"],
    }),

    getAllPublicContact: builder.query<
      IPublicContactResponse,
      { page?: number; limit?: number } | void
    >({
      query: (args) => {
        const { page = 1, limit = 10 } = args || {};

        return {
          url: "/contact",
          params: { page, limit },
        };
      },
      providesTags: ["PublicContactSupport"],
    }),

    getSinglePublicContactSupport: builder.query<
      ISinglePublicContactResponse,
      string
    >({
      query: (id) => ({
        url: `/contact/${id}`,
      }),
      providesTags: ["PublicContactSupport"],
    }),

    deletePublicContactSupport: builder.mutation<IBaseResponse, string>({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PublicContactSupport"],
    }),
  }),
});

export const {
  useGetAllContactSupportQuery,
  useGetAllPublicContactQuery,
  useGetSinglePublicContactSupportQuery,
  useLazyGetSinglePublicContactSupportQuery,
  useDeletePublicContactSupportMutation,
} = contactSupportApi;

export default contactSupportApi;
