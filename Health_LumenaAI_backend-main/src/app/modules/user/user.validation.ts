
import { z } from 'zod';
import {
  GenderEnum,
  ServiceCategory,
  DayOfWeek,
  ServiceAvailability,
  ShiftType,
  TravelDistance,
  LanguageEnum,
  SupportFor,
  SupportActivity,
  StaffStatus
} from '@prisma/client';

// Convert Prisma enums to Zod enums
const GenderEnumSchema = z.nativeEnum(GenderEnum);
const ServiceCategorySchema = z.array(z.nativeEnum(ServiceCategory));
const DayOfWeekSchema = z.nativeEnum(DayOfWeek);
const ServiceAvailabilitySchema = z.nativeEnum(ServiceAvailability);
const StuffStatusSchema = z.nativeEnum(StaffStatus);
const ShiftTypeSchema = z.nativeEnum(ShiftType);
const TravelDistanceSchema = z.nativeEnum(TravelDistance);
const LanguageEnumSchema = z.nativeEnum(LanguageEnum);

// Main validation schema
export const registerStaffValidation = z.object({
  // User fields
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hourlyRate: z.string().min(2, "Hourly rate must be at least 2 characters"),
  gender: GenderEnumSchema,
  phoneNumber: z.string().optional(),
  age: z
    .number({
      required_error: "Age is required",
      invalid_type_error: "Age must be a number",
    }),
  latitude: z
    .number({
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a number",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z
    .number({
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a number",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),  // Address fields
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),

  // Staff required fields
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500).optional(),
  // Staff optional fields with Prisma enums
  serviceCategory: ServiceCategorySchema,
  dayOfWeek: z.array(DayOfWeekSchema).optional().default([]),
  endTime: z.string().optional(),
  expertise: z.array(z.string()).optional().default([""]),
  serviceAvailability: ServiceAvailabilitySchema.optional().default(ServiceAvailability.IMMEDIATE),
  startTime: z.string().optional(),
  stuffStatus: StuffStatusSchema.optional().default(StaffStatus.INACTIVE),
  shiftType: z.array(ShiftTypeSchema).optional().default([]),
  totalWorkTime: z.string().optional(),
  qualifications: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
  languages: z.array(LanguageEnumSchema).optional().default([]),
  skills: z.array(z.nativeEnum(SupportActivity)),
  travelDistance: TravelDistanceSchema.optional().default(TravelDistance.WITHIN_20_KM),
});
export const registerCustomerSchema = z.object({
  // User fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phoneNumber: z.string().optional(),
  gender: z.nativeEnum(GenderEnum).optional(),
  about: z.string().optional(),
  latitude: z
    .number({
      required_error: "Latitude is required",
      invalid_type_error: "Latitude must be a number",
    })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),

  longitude: z
    .number({
      required_error: "Longitude is required",
      invalid_type_error: "Longitude must be a number",
    })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  // Customer fields
  bio: z.string().optional(),
  isAdult: z.boolean().default(true),
  supportFor: z.nativeEnum(SupportFor).default(SupportFor.FAMILY_MEMBER),
  haveFunding: z.boolean().default(false),
});
