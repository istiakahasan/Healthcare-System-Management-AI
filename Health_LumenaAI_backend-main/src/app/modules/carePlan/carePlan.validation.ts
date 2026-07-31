import { CarePlanStatus, CarePlanType, DayOfWeek, ServiceCategory, ShiftType, SupportActivity } from '@prisma/client';
import { z } from 'zod';

const ShiftTypeSchema = z.nativeEnum(ShiftType);

export const createCarePlanSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    dayOfWeek: z.array(z.nativeEnum(DayOfWeek)).default([]),
    startDate: z
        .string()
        .refine(
            (val) => !isNaN(Date.parse(val)),
            { message: "Start date must be a valid ISO date string" }),
    carePlanType: z.nativeEnum(CarePlanType).default(CarePlanType.WEEKLY),
    durationOfWeek: z.number({ required_error: "durationOfWeek is required!" }),
    carePlanShift: z.array(ShiftTypeSchema).optional().default([]),
    serviceCategory: z.array(z.nativeEnum(ServiceCategory).default(ServiceCategory.DISABILITES_CARE)),
    supportActivity: z.array(z.nativeEnum(SupportActivity)).min(1, "At least one support activity is required"),
    careGoals: z.array(z.string()).default([]),
})

export const updateCarePlanSchema = createCarePlanSchema.partial()