import { CarePlanType, ShiftRequestStatus, StaffStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import {
  calculateDistance,
  calculateStaffAvailability,
} from "../staff/staff.utils";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import { sendShiftNotification } from "../../helpers/sendShiftNotification";
import QueryBuilder from "../../builder/QueryBuilder";
import httpStatus from "http-status";
export const ShiftService = {
  // Updated matchStaffWithMCDM with enhanced availability scoring

  sendShiftRequest: async (
    payload: { carePlanId: string; staffId: string },
    requesterId: string,
  ) => {
    // Step 1: Validate requester (must exist in Customer collection)
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!requester) {
      throw new ApiError(status.NOT_FOUND, "User not found to send request!");
    }
    const customer = await prisma.customer.findUnique({
      where: { userId: requesterId },
    });
    if (!customer) {
      throw new ApiError(
        status.NOT_FOUND,
        "Customer not found to send request!",
      );
    }
    // Step 2: Validate CarePlan existence
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: payload.carePlanId },
      select: { id: true },
    });

    if (!carePlan) {
      throw new ApiError(status.NOT_FOUND, "Care plan not found!");
    }
    const shiftReqExists = await prisma.shiftRequest.findFirst({
      where: {
        carePlanId: payload.carePlanId,
        requestedBy: customer.id,
        shiftRequestStatus: ShiftRequestStatus.PENDING,
      },
    });

    if (shiftReqExists) {
      throw new ApiError(
        status.CONFLICT,
        "You Already SENT a Shift Request To this STAFF!",
      );
    }

    // Step 3: Validate Staff existence
    const staff = await prisma.staff.findUnique({
      where: { id: payload.staffId },
      select: {
        id: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!staff) {
      throw new ApiError(status.NOT_FOUND, "Staff not found!");
    }

    // Step 4: Create shift request
    await prisma.shiftRequest.create({
      data: {
        carePlanId: payload.carePlanId,
        staffId: payload.staffId,
        requestedBy: customer.id,
      },
    });
    await sendShiftNotification({
      receiverId: staff.user.id,
      staffName: `${requester.firstName} ${requester.lastName}`,
      type: "REQUESTED",
    });
    return {
      message: "Your shift request has been sent!",
    };
  },

  myShiftRequest: async (userId: string) => {
    const staff = await prisma.staff.findUnique({
      where: { userId },
      select: { id: true },
    });

    const result = await prisma.shiftRequest.findMany({
      where: { staffId: staff?.id },
      include: { requester: true, carePlan: true },
    });
    return result;
  },
  shiftRequestDetails: async (shiftId: string) => {
    console.log(shiftId);

    const result = await prisma.shiftRequest.findUnique({
      where: { id: shiftId },
      select: {
        id: true,
        createdAt: true,
        shiftRequestStatus: true,
        staff: {
          select: {
            id: true,
            user: {
              select: {
                address: {
                  select: {
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        },
        carePlan: {
          select: {
            id: true,
            startDate: true,
            carePlanShift: true,
            carePlanType: true,
            dayOfWeek: true,
            totalShifts: true,
            description: true,
            serviceCategory: true,
            supportActivity: true,
            careGoals: true,
            customer: {
              select: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                  },
                },
              },
            },
            patient: {
              select: {
                id: true,
                age: true,
                firstName: true,
                lastName: true,
                gender: true,
                notes: true,
                riskFactors: true,
                selfCustomer: true,
                address: {
                  select: {
                    city: true,
                    country: true,
                    state: true,
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Shift request not found");
    }

    // Calculate distance
    const staffLat = result?.staff.user.address[0]?.latitude;
    const staffLon = result?.staff.user.address[0]?.longitude;
    const patientLat = result?.carePlan.patient.address[0]?.latitude;
    const patientLon = result?.carePlan.patient.address[0]?.longitude;

    const distance = calculateDistance(
      patientLat!,
      patientLon!,
      staffLat!,
      staffLon!,
    );
    const myAvailability = await calculateStaffAvailability(
      result?.carePlan.id!,
      result?.staff.id!,
    );
    const organizedData = {
      id: result?.id,
      createdAt: result?.createdAt,
      shiftRequestStatus: result?.shiftRequestStatus,
      startDate: result?.carePlan.startDate,
      carePlanShift: result?.carePlan.carePlanShift,
      carePlanType: result?.carePlan.carePlanType,
      dayOfWeek: result?.carePlan.dayOfWeek,
      totalShifts: result?.carePlan.totalShifts,
      myAvailability,
      description: result?.carePlan.description,
      serviceCategory: result?.carePlan.serviceCategory,
      supportActivity: result?.carePlan.supportActivity,
      careGoals: result?.carePlan.careGoals,
      distance: Math.round(distance),
      duration: Math.round(Number(result?.carePlan.totalShifts) * 8),
      client: {
        id: result?.carePlan.customer.user.id,
        firstName: result?.carePlan.customer.user.firstName,
        lastName: result?.carePlan.customer.user.lastName,
        phoneNumber: result?.carePlan.customer.user.phoneNumber,
      },
      patient: {
        id: result?.carePlan.patient.id,
        age: result?.carePlan.patient.age,
        firstName: result?.carePlan.patient.firstName,
        lastName: result?.carePlan.patient.lastName,
        gender: result?.carePlan.patient.gender,
        notes: result?.carePlan.patient.notes,
        riskFactors: result?.carePlan.patient.riskFactors,
        selfCustomer: result?.carePlan.patient.selfCustomer,
      },
      address: {
        city: result?.carePlan.patient.address[0]?.city,
        state: result?.carePlan.patient.address[0]?.state,
        country: result?.carePlan.patient.address[0]?.country,
      },
    };

    return organizedData;
  },

  acceptShiftRequest: async (shiftReqId: string) => {
    const shiftRequest = await prisma.shiftRequest.findUnique({
      where: {
        id: shiftReqId,
      },
      select: {
        createdAt: true,
        shiftRequestStatus: true,
        requestedBy: true,
        requester: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        carePlan: {
          select: {
            id: true,
            dayOfWeek: true,
            durationOfWeek: true,
            carePlanType: true,
            startDate: true,
            status: true,
            carePlanShift: true,
            totalShifts: true,
            patient: {
              select: { id: true },
            },
          },
        },
        staff: {
          select: {
            id: true,
            dayOfWeek: true,
            shiftType: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    if (!shiftRequest) {
      throw new ApiError(status.NOT_FOUND, "Shift Request Not found!");
    }
    if (shiftRequest?.shiftRequestStatus !== ShiftRequestStatus.PENDING) {
      throw new ApiError(
        status.CONFLICT,
        `This request is already ${shiftRequest.shiftRequestStatus}`,
      );
    }

    // Default shift timings
    const shiftTimes: Record<string, { start: string; end: string }> = {
      MORNING: { start: "06:00", end: "14:00" },
      EVENING: { start: "14:00", end: "22:00" },
      NIGHT: { start: "22:00", end: "06:00" },
    };

    let createdShiftCount = 0;

    if (shiftRequest?.carePlan.carePlanType === CarePlanType.ONE_OFF) {
      const matchingShifts = shiftRequest.carePlan.carePlanShift.filter(
        (shift) => shiftRequest.staff.shiftType.includes(shift),
      );

      for (const shift of matchingShifts) {
        const times = shiftTimes[shift];
        if (!times) continue;

        const startDateTime = new Date(shiftRequest.carePlan.startDate);
        startDateTime.setHours(
          parseInt(times.start.split(":")[0]),
          parseInt(times.start.split(":")[1]),
          0,
          0,
        );

        let endDateTime = new Date(shiftRequest.carePlan.startDate);
        endDateTime.setHours(
          parseInt(times.end.split(":")[0]),
          parseInt(times.end.split(":")[1]),
          0,
          0,
        );

        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const existingShift = await prisma.shift.findFirst({
          where: {
            staffId: shiftRequest.staff.id,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
          },
        });

        if (existingShift) {
          console.log(`Shift for ${shift} already exists for staff. Skipping.`);
          continue;
        }

        await prisma.shift.create({
          data: {
            staffId: shiftRequest.staff.id,
            carePlanId: shiftRequest.carePlan.id,
            patientId: shiftRequest.carePlan.patient.id,
            shiftType: shift,
            startDateTime,
            endDateTime,
            status: "SCHEDULED",
          },
        });
        createdShiftCount++;
        console.log(`Shift for ${shift} created successfully.`);
      }
    }

    if (shiftRequest?.carePlan.carePlanType === CarePlanType.WEEKLY) {
      const matchedWorkingDays = shiftRequest.carePlan.dayOfWeek.filter((day) =>
        shiftRequest.staff.dayOfWeek.includes(day),
      );

      const durationOfWeek = shiftRequest.carePlan.durationOfWeek || 1;

      for (let week = 0; week < durationOfWeek; week++) {
        for (const day of matchedWorkingDays) {
          // ✅ FIX: Create a NEW Date object for each day calculation
          const baseDate = new Date(shiftRequest.carePlan.startDate);

          const dayMap: Record<string, number> = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6,
          };
          const targetDay = dayMap[day];
          const currentDay = baseDate.getDay();
          let diff = targetDay - currentDay;
          if (diff < 0) diff += 7; // Move to next occurrence of this day
          diff += week * 7; // Then add the week offset

          const shiftDate = new Date(baseDate); // ✅ Create fresh date for this specific day
          shiftDate.setDate(shiftDate.getDate() + diff);

          const matchingShifts = shiftRequest.carePlan.carePlanShift.filter(
            (shift) => shiftRequest.staff.shiftType.includes(shift),
          );

          for (const shift of matchingShifts) {
            const times = shiftTimes[shift];
            if (!times) continue;

            const startDateTime = new Date(shiftDate);
            startDateTime.setHours(
              parseInt(times.start.split(":")[0]),
              parseInt(times.start.split(":")[1]),
              0,
              0,
            );

            let endDateTime = new Date(shiftDate);
            endDateTime.setHours(
              parseInt(times.end.split(":")[0]),
              parseInt(times.end.split(":")[1]),
              0,
              0,
            );

            if (endDateTime <= startDateTime) {
              endDateTime.setDate(endDateTime.getDate() + 1);
            }

            const existingShift = await prisma.shift.findFirst({
              where: {
                staffId: shiftRequest.staff.id,
                startDateTime,
                endDateTime,
              },
            });

            if (existingShift) continue;

            await prisma.shift.create({
              data: {
                staffId: shiftRequest.staff.id,
                carePlanId: shiftRequest.carePlan.id,
                patientId: shiftRequest.carePlan.patient.id,
                shiftType: shift,
                startDateTime,
                endDateTime,
                status: "SCHEDULED",
              },
            });
            createdShiftCount++;
          }
        }
      }
    }

    // Update the boolean field based on actual possible shifts
    if (createdShiftCount > 0) {
      // Get current count of booked shifts for this care plan
      const currentBookedShifts = await prisma.shift.count({
        where: {
          carePlanId: shiftRequest.carePlan.id,
        },
      });

      // Check if all possible shifts are booked
      const allShiftsBooked =
        currentBookedShifts >= shiftRequest.carePlan.totalShifts;

      await prisma.$transaction(async (tx) => {
        // Update both isFullyStaffed and totalShifts fields
        await prisma.carePlan.update({
          where: {
            id: shiftRequest.carePlan.id,
          },
          data: {
            isFullyStaffed: allShiftsBooked,
          },
        });

        await tx.shiftRequest.update({
          where: {
            id: shiftReqId,
          },
          data: {
            shiftRequestStatus: ShiftRequestStatus.ACCEPTED,
          },
        });
      });

      await sendShiftNotification({
        receiverId: shiftRequest.requester.user.id,
        staffName: `${shiftRequest.staff.user.firstName} ${shiftRequest.staff.user.lastName}`,
        type: "ACCEPTED",
      });
    }

    return {
      message: "Shift Created Successfully!",
      createdShifts: createdShiftCount,
    };
  },

  rejectShiftRequest: async (shiftReqId: string, declineReason: string) => {
    const shiftRequest = await prisma.shiftRequest.findUnique({
      where: { id: shiftReqId },
      select: {
        id: true,
        shiftRequestStatus: true,
        requestedBy: true,
        requester: {
          select: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        staff: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!shiftRequest) {
      throw new ApiError(status.NOT_FOUND, "Shift Request Not found!");
    }

    if (shiftRequest.shiftRequestStatus !== ShiftRequestStatus.PENDING) {
      throw new ApiError(
        status.CONFLICT,
        `Your request is already ${shiftRequest.shiftRequestStatus}`,
      );
    }

    // ✅ First, update inside transaction
    await prisma.$transaction(async (tx) => {
      await tx.shiftRequest.update({
        where: { id: shiftReqId },
        data: {
          shiftRequestStatus: ShiftRequestStatus.DECLINED,
          declineReason,
        },
      });
    });

    // ✅ Now it returns a proper result object
    await sendShiftNotification({
      receiverId: shiftRequest.requester.user.id,
      staffName: `${shiftRequest.staff.user.firstName} ${shiftRequest.staff.user.lastName}`,
      type: "REJECTED",
    });
  },

  getUnassignedShifts: async (carePlanId: string) => {
    const carePlan = await prisma.carePlan.findUnique({
      where: { id: carePlanId },
      select: {
        id: true,
        carePlanShift: true,
        dayOfWeek: true,
        startDate: true,
        durationOfWeek: true,
        totalShifts: true,
        carePlanType: true,
      },
    });

    if (!carePlan) throw new ApiError(status.NOT_FOUND, "Care plan not found");

    const daysOfWeekMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    // 1️⃣ Generate ALL possible shifts that should exist according to care plan
    const allPossibleShifts: {
      shiftType: string;
      startDateTime: Date;
      endDateTime: Date;
    }[] = [];
    const shiftTimes: Record<string, { start: number; end: number }> = {
      MORNING: { start: 6, end: 14 },
      EVENING: { start: 14, end: 22 },
      NIGHT: { start: 22, end: 6 },
    };

    const startDate = new Date(carePlan.startDate);

    if (carePlan.carePlanType === "ONE_OFF") {
      // For ONE_OFF care plan, only create shifts on the startDate
      for (const shiftType of carePlan.carePlanShift) {
        const times = shiftTimes[shiftType];
        const startDateTime = new Date(startDate);
        startDateTime.setHours(times.start, 0, 0, 0);

        const endDateTime = new Date(startDate);
        endDateTime.setHours(times.end, 0, 0, 0);
        if (endDateTime <= startDateTime)
          endDateTime.setDate(endDateTime.getDate() + 1);

        allPossibleShifts.push({ shiftType, startDateTime, endDateTime });
      }
    } else if (carePlan.carePlanType === "WEEKLY") {
      // For WEEKLY care plan, create shifts for each dayOfWeek for durationOfWeek
      for (let week = 0; week < carePlan.durationOfWeek; week++) {
        for (const day of carePlan.dayOfWeek) {
          const currentDate = new Date(startDate);
          const targetDay = daysOfWeekMap[day];
          const currentDay = currentDate.getDay();
          let diff = targetDay - currentDay + week * 7;
          if (diff < 0) diff += 7;
          currentDate.setDate(currentDate.getDate() + diff);

          for (const shiftType of carePlan.carePlanShift) {
            const times = shiftTimes[shiftType];
            const startDateTime = new Date(currentDate);
            startDateTime.setHours(times.start, 0, 0, 0);

            const endDateTime = new Date(currentDate);
            endDateTime.setHours(times.end, 0, 0, 0);
            if (endDateTime <= startDateTime)
              endDateTime.setDate(endDateTime.getDate() + 1);

            allPossibleShifts.push({ shiftType, startDateTime, endDateTime });
          }
        }
      }
    }

    // 2️⃣ Get all shifts that are actually created in the database
    const assignedShifts = await prisma.shift.findMany({
      where: { carePlanId: carePlan.id },
      select: {
        shiftType: true,
        startDateTime: true,
        endDateTime: true,
      },
    });

    // 3️⃣ Create a Set of assigned shifts for quick lookup
    const assignedShiftKeys = new Set(
      assignedShifts.map(
        (s) =>
          `${s.shiftType}-${s.startDateTime.toISOString()}-${s.endDateTime.toISOString()}`,
      ),
    );

    // 4️⃣ Filter to find shifts that should exist but aren't created yet
    const unassignedShifts = allPossibleShifts.filter((possibleShift) => {
      const shiftKey = `${possibleShift.shiftType}-${possibleShift.startDateTime.toISOString()}-${possibleShift.endDateTime.toISOString()}`;
      return !assignedShiftKeys.has(shiftKey);
    });

    return unassignedShifts;
  },
  myShifts: async (userId: string, query: Record<string, unknown>) => {
    console.log("", query);

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      return [];
    }

    const shiftQuery = new QueryBuilder(prisma.shift, query)
      .search([
        "staff.user.firstName",
        "staff.user.lastName",
        "staff.user.email",
      ])
      .filter()
      .sort()
      .paginate()
      .select({
        id: true,
        startDateTime: true,
        carePlan: {
          select: {
            carePlanType: true,
            serviceCategory: true,
          },
        },
        staff: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        status: true,
      });

    const [result, meta] = await Promise.all([
      shiftQuery.execute(),
      shiftQuery.countTotal(),
    ]);

    const shifts = result.map((shift: any) => ({
      id: shift.id,
      startDateTime: shift.startDateTime,
      carePlanType: shift.carePlan?.carePlanType ?? null,
      serviceCategory: shift.carePlan?.serviceCategory?.[0] ?? null,
      staff: shift.staff?.user
        ? {
            firstName: shift.staff.user.firstName,
            lastName: shift.staff.user.lastName,
            email: shift.staff.user.email,
          }
        : null,
      status: shift.status,
    }));

    return {
      meta,
      data: shifts,
    };
  },

  shiftDetails: async (shiftId: string) => {
    const shift = await prisma.shift.findUnique({
      where: {
        id: shiftId,
      },
      select: {
        id: true,
        status: true,
        startDateTime: true,
        endDateTime: true,
        shiftType: true,
        patient: {
          select: {
            address: {
              select: {
                city: true,
                state: true,
                country: true,
                latitude: true,
                longitude: true,
              },
            },
          },
        },
        carePlan: {
          select: {
            serviceCategory: true,
            carePlanType: true,
            dayOfWeek: true,
            carePlanShift: true,
          },
        },
        staff: {
          select: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                profileImage: true,
                address: {
                  select: {
                    latitude: true,
                    longitude: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shift) {
      return null;
    }

    const start = new Date(shift.startDateTime);
    const end = new Date(shift.endDateTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const distance = Math.round(
      calculateDistance(
        shift.patient.address[0].latitude!,
        shift.patient.address[0].longitude!,
        shift.staff!.user.address[0].latitude!,
        shift.staff!.user.address[0].longitude!,
      ),
    );

    const shiftDetails = {
      id: shift.id,
      startDateTime: shift.startDateTime,
      duration,
      distance,
      location: `${shift.patient.address[0].city}, ${shift.patient.address[0].state}, ${shift.patient.address[0].country}`,
      carePlanType: shift.carePlan.carePlanType,
      dayOfWeek: shift.carePlan.dayOfWeek,
      shift: shift.shiftType,
      status: shift.status,
      staff: {
        id: shift.staff!.user.id,
        firstName: shift.staff!.user.firstName,
        lastName: shift.staff!.user.lastName,
        email: shift.staff!.user.email,
        profileImage: shift.staff!.user.profileImage,
      },
    };

    return shiftDetails;
  },
};
