import z from "zod";

export const ContactValidation = {
  createContact: z.object({
    name: z.string(),
    email: z.string().email(),
    subject: z.string(),
    message: z.string(),
  }),
  getAllContacts: z.object({}),
  getContact: z.object({
    id: z.string(),
  }),
  deleteContact: z.object({
    id: z.string(),
  }),
};
