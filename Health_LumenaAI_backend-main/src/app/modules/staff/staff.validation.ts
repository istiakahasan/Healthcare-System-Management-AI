import { GenderEnum, LanguageEnum } from "@prisma/client";
import z from "zod";

export interface MatchStaffInput {
  gender: GenderEnum;
  carePlanId: string;
  min_age:
    | "18"
    | "21"
    | "25"
    | "30"
    | "35"
    | "40"
    | "45"
    | "50"
    | "55"
    | "60"
    | "65"
    | "70";
  max_age:
    | "21"
    | "25"
    | "30"
    | "35"
    | "40"
    | "45"
    | "50"
    | "55"
    | "60"
    | "65"
    | "70"
    | "75";
  languages: LanguageEnum[];
}

export const matchStaffSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "NOT_PREFERRED", "OTHER"], {
    required_error: "Gender is required",
    invalid_type_error: "Invalid gender selection",
  }),
  carePlanId: z.string({
    required_error: "carePlanId is required",
    invalid_type_error: "Invalid carePlan entered",
  }),
  min_age: z.enum(
    ["18", "21", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70"],
    {
      required_error: "min age is required",
      invalid_type_error: "Invalid age selection",
    }
  ),
  max_age: z.enum(
    ["21", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75"],
    {
      required_error: "min age is required",
      invalid_type_error: "Invalid age selection",
    }
  ),
languages: z
  .string()
  .transform((str) => {
    // Split by comma, trim each value, remove empty strings
    return str
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  })
  .refine((arr) => arr.length > 0, "At least one language must be selected")
  .superRefine((langs, ctx) => {
    const allowed = Object.values(LanguageEnum);
    const invalid = langs.filter((lang) => !allowed.includes(lang as LanguageEnum));
    if (invalid.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid languages: ${invalid.join(", ")}. Allowed: ${allowed.join(", ")}`,
        path: ["languages"],
      });
    }
  }),


});
