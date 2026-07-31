import { DayOfWeek, LanguageEnum, CarePlanType, ServiceAvailability, ShiftType, TravelDistance } from "@prisma/client";
import prisma from "../../lib/prisma";

// ============================================================================
// MATCHING WEIGHTS - Adjust these to fine-tune the matching algorithm
// ============================================================================
export const MATCHING_WEIGHTS = {
    language: 0.05,        // 15% - Communication compatibility
    skills: 0.25,          // 25% - Care quality and experience (highest priority)
    distance: 0.20,        // 20% - Travel feasibility
    availability: 0.20,    // 10% - Schedule match (enhanced below)
    age: 0.05,             // 10% - Age proximity or preference
    gender: 0.05,
    shift: 0.20          // 20% - Shift preference match
};

// Distance thresholds (in km)
const DISTANCE_THRESHOLDS = {
    WITHIN_5_KM: 5,
    WITHIN_10_KM: 10,
    WITHIN_20_KM: 20,
    WITHIN_30_KM: 30,
    ANYWHERE: Infinity,
};

export interface StaffScore {
    id: string;
    profileImage: string;
    totalScore: number;
    breakdown: {
        language: number;
        skills: number;
        distance: number;
        availability: number;
        age: number;
        gender: number;
    }
}


// HELPER FUNCTIONS
function toRad(value: number): number {
    return (value * Math.PI) / 180;
}


// DISTANCE CALCULATION
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const scoreLanguage = (
    staffLanguages: LanguageEnum[],
    requiredLanguages: LanguageEnum[]
): number => {
    // If no language requirement, perfect match
    if (!requiredLanguages || requiredLanguages.length === 0) return 1.0;

    const matchedLanguages = staffLanguages.filter(lang =>
        requiredLanguages.includes(lang)
    );

    // Return percentage of required languages that staff speaks
    return matchedLanguages.length / requiredLanguages.length;
};

export const scoreSkills = (
    staffSkills: string[],
    supportActivity: string[],
): number => {
    // If no specific activities required, perfect match
    if (!supportActivity || supportActivity.length === 0) return 1.0;

    // Case-insensitive comparison using Sets for efficiency
    const staffSet = new Set(staffSkills.map(s => s.toLowerCase()));
    const requiredSet = new Set(supportActivity.map(a => a.toLowerCase()));

    let matches = 0;
    requiredSet.forEach(activity => {
        if (staffSet.has(activity)) matches++;
    });

    // Return percentage of required activities the staff can perform
    return matches / requiredSet.size;
};

export const scoreDistance = (
    distance: number,
    travelDistance: TravelDistance
): number => {
    const maxDistance = DISTANCE_THRESHOLDS[travelDistance as keyof typeof DISTANCE_THRESHOLDS];

    // Beyond staff's travel limit - no match
    if (distance > maxDistance) return 0.0;

    // Within 5km - perfect score
    if (distance <= 5) return 1.0;

    // Linear decay from 1.0 to 0.0 based on max distance
    // Example: If max is 20km and distance is 10km, score = 1 - (10/20) = 0.5
    return Math.max(0, 1 - distance / maxDistance);
};

export const scoreAvailability = (
    staffDays: DayOfWeek[],
    carePlanDays: DayOfWeek[]
): number => {
    if (!carePlanDays || carePlanDays.length === 0) return 1.0;

    const matchedDays = carePlanDays.filter(day => staffDays.includes(day));

    return matchedDays.length / carePlanDays.length;
};

export const matchShift = (staffShift: string[], carePlanShift: string[]): number => {
    if (!staffShift.length || !carePlanShift.length) return 0.0;

    // Count matching shifts
    const matches = staffShift.filter(shift => carePlanShift.includes(shift)).length;

    if (matches === 0) return 0.0; // no match

    // Exact match (all care plan shifts exactly match staff shifts, no extra)
    if (
        matches === carePlanShift.length &&
        staffShift.length === carePlanShift.length
    ) {
        return 1.0;
    }

    // Partial match penalty for extra or missing shifts
    const overlapScore = matches / carePlanShift.length; // fraction of care plan covered
    const extraPenalty = staffShift.length > carePlanShift.length
        ? (carePlanShift.length / staffShift.length) // reduce score if staff has extra shifts
        : 1;

    return parseFloat((overlapScore * extraPenalty).toFixed(2));
};


export const matchGender = (
    preferredGender: string,
    staffGender: string
): number => {
    // If no preference given, treat as full match
    if (!preferredGender || preferredGender.toUpperCase() === "ANY") {
        return 1.0;
    }

    // Exact match (case-insensitive)
    if (preferredGender.toUpperCase() === staffGender.toUpperCase()) {
        return 1.0;
    }

    // No match
    return 0.0;
};

export const matchAge = (
    min_age: string,
    max_age: string,
    age: string
): number => {
    const min = Number(min_age);
    const max = Number(max_age);
    const personAge = Number(age);

    // Invalid age data
    if (isNaN(min) || isNaN(max) || isNaN(personAge)) return 0.0;

    // Perfect match - within range
    if (personAge >= min && personAge <= max) return 1.0;

    // Close but outside range - partial score
    // This allows some flexibility (e.g., someone 29 when range is 30-50)
    const buffer = 5; // 5 year buffer
    if (personAge >= min - buffer && personAge <= max + buffer) return 0.5;

    // Too far outside range
    return 0.0;
};


const scoreDayAvailability = (
    staffDays: DayOfWeek[],
    carePlanDays: DayOfWeek[]
): number => {
    // No specific days required - perfect match
    if (!carePlanDays || carePlanDays.length === 0) return 1.0;

    // Staff has no availability - no match
    if (!staffDays || staffDays.length === 0) return 0.0;

    // Count matching days
    const matchingDays = carePlanDays.filter(day =>
        staffDays.includes(day)
    ).length;

    // Return percentage of required days that staff is available
    return matchingDays / carePlanDays.length;
};

const scoreCarePlanTypeCompatibility = (
    carePlanType: CarePlanType,
    staffServiceAvailability: ServiceAvailability
): number => {
    const compatibilityMatrix: Record<CarePlanType, Partial<Record<ServiceAvailability, number>>> = {
        // One-off care: Prefer staff available immediately
        [CarePlanType.ONE_OFF]: {
            [ServiceAvailability.IMMEDIATE]: 1.0,
            [ServiceAvailability.WITHIN_WEEK]: 0.9,
            [ServiceAvailability.FLEXIBLE]: 0.7,
        },
        // Weekly recurring: Prefer staff with regular weekly availability
        [CarePlanType.WEEKLY]: {
            [ServiceAvailability.IMMEDIATE]: 0.9,
            [ServiceAvailability.WITHIN_WEEK]: 1.0,
            [ServiceAvailability.FLEXIBLE]: 0.8,
        },
    };

    const score = compatibilityMatrix[carePlanType]?.[staffServiceAvailability];
    return typeof score === 'number' ? score : 0.5;
};

export const scoreAvailabilityEnhanced = (
    staff: {
        dayOfWeek?: DayOfWeek[];
        startTime?: string | null;
        endTime?: string | null;
        shiftType?: ShiftType[];
        serviceAvailability: ServiceAvailability;
    },
    carePlan: {
        dayOfWeek?: DayOfWeek[];
        carePlanType: CarePlanType;
        startDate: Date;
    }
): number => {
    // 1. Score day availability (40% weight)
    const dayScore = scoreDayAvailability(
        staff.dayOfWeek || [],
        carePlan.dayOfWeek || []
    );

    // 2. Score care plan type compatibility (25% weight)
    const typeScore = scoreCarePlanTypeCompatibility(
        carePlan.carePlanType,
        staff.serviceAvailability
    );

    // Calculate weighted total (0-100 scale)
    const totalScore = (
        dayScore * 0.40 +
        typeScore * 0.60
    );

    return totalScore;
};

export const calculateStaffAvailability = async (carePlanId: string, staffId: string) => {
    // Default shift timings
    const shiftTimes: Record<string, { start: string; end: string }> = {
        MORNING: { start: "06:00", end: "14:00" },
        EVENING: { start: "14:00", end: "22:00" },
        NIGHT: { start: "22:00", end: "06:00" }
    };

    const carePlan = await prisma.carePlan.findUnique({ where: { id: carePlanId } });
    const staff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!carePlan || !staff) return 0;
    let shiftCount = 0;
    if (carePlan.carePlanType === CarePlanType.ONE_OFF) {
        const matchingShifts = carePlan.carePlanShift.filter(shift =>
            staff.shiftType.includes(shift)
        );

        for (const shift of matchingShifts) {
            const times = shiftTimes[shift];
            if (!times) continue;

            const startDateTime = new Date(carePlan.startDate);
            startDateTime.setHours(parseInt(times.start.split(":")[0]), parseInt(times.start.split(":")[1]), 0, 0);

            let endDateTime = new Date(carePlan.startDate);
            endDateTime.setHours(parseInt(times.end.split(":")[0]), parseInt(times.end.split(":")[1]), 0, 0);

            if (endDateTime <= startDateTime) {
                endDateTime.setDate(endDateTime.getDate() + 1);
            }

            const existingShift = await prisma.shift.findFirst({
                where: {
                    staffId,
                    startDateTime: startDateTime,
                    endDateTime: endDateTime
                }
            });

            if (existingShift) {
                console.log(`Shift for ${shift} already exists for staff. Skipping.`);
                continue;
            }
            shiftCount++;
            console.log(`Shift for ${shift} created successfully.`);
        }
    } else if (carePlan.carePlanType === CarePlanType.WEEKLY) {
        // Safely read dayOfWeek from the Prisma user record (may not be present on the generated type)
        const matchedWorkingDays = carePlan.dayOfWeek.filter(day =>
            staff.dayOfWeek.includes(day)
        );
        const durationOfWeek = carePlan.durationOfWeek || 1;

        for (let week = 0; week < durationOfWeek; week++) {
            for (const day of matchedWorkingDays) {
                // ✅ FIX: Create a NEW Date object for each day calculation
                const baseDate = new Date(carePlan.startDate);

                const dayMap: Record<string, number> = {
                    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
                    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
                };
                const targetDay = dayMap[day];
                const currentDay = baseDate.getDay();
                let diff = targetDay - currentDay;
                if (diff < 0) diff += 7; // Move to next occurrence of this day
                diff += week * 7; // Then add the week offset

                const shiftDate = new Date(baseDate); // ✅ Create fresh date for this specific day
                shiftDate.setDate(shiftDate.getDate() + diff);

                const matchingShifts = carePlan.carePlanShift.filter(shift =>
                    staff.shiftType.includes(shift)
                );

                for (const shift of matchingShifts) {
                    const times = shiftTimes[shift];
                    if (!times) continue;

                    const startDateTime = new Date(shiftDate);
                    startDateTime.setHours(parseInt(times.start.split(":")[0]), parseInt(times.start.split(":")[1]), 0, 0);

                    let endDateTime = new Date(shiftDate);
                    endDateTime.setHours(parseInt(times.end.split(":")[0]), parseInt(times.end.split(":")[1]), 0, 0);

                    if (endDateTime <= startDateTime) {
                        endDateTime.setDate(endDateTime.getDate() + 1);
                    }

                    const existingShift = await prisma.shift.findFirst({
                        where: {
                            staffId: staff.id,
                            startDateTime,
                            endDateTime
                        }
                    });

                    if (existingShift) continue;

                    shiftCount++;
                }
            }
        }
    }

    return shiftCount
}