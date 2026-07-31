import { GenderEnum } from "@prisma/client";
import { z } from "zod";

export const createPatientSchema = z.object({
  firstName: z.string({
    required_error: "First name is required",
  }),
  lastName: z.string({
    required_error: "Last name is required",
  }),
  age: z
    .string({
      required_error: "Age is required",
    })
    .regex(/^\d+(\s*(years|year|yrs|y))?$/, "Invalid age format"), // accepts "45", "2 years"

  gender: z.nativeEnum(GenderEnum),
  medicalHistory: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional(),
  selfCustomerId: z.string().optional(),
  riskFactors: z.array(z.string()).optional(),

});

export const updatePatientSchema = createPatientSchema.partial();