import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { CarePlan, CarePlanStatus, UserRole } from "@prisma/client";
import { ShiftService } from "../shift/shift.service";
export const CarePlanService = {
  // Create new care plan
  add: async (userId: string, payload: CarePlan) => {
    const { patientId, startDate, carePlanType, dayOfWeek, carePlanShift } =
      payload;

    // ✅ 1. Verify user exists and is a customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, customer: { select: { id: true } } },
    });

    if (!user || !user.customer?.id) {
      throw new ApiError(status.NOT_FOUND, "Customer not found!");
    }
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

    // ✅ 2. Validate required fields
    if (!patient) {
      throw new ApiError(status.NOT_FOUND, "Patient  is not found!");
    }

    if (!startDate) {
      throw new ApiError(status.BAD_REQUEST, "Start date is required!");
    }

    if (carePlanType === "WEEKLY") {
      if (!dayOfWeek?.length) {
        throw new ApiError(
          status.BAD_REQUEST,
          "Please select at least one day for weekly care plan!",
        );
      }
    }

    // ✅ 3. Overlap check (same patient + active + date conflict)

    const overlappingPlan = await prisma.carePlan.findFirst({
      where: {
        patientId: payload.patientId,
        status: CarePlanStatus.ACTIVE,
      },
    });

    if (overlappingPlan) {
      throw new ApiError(
        status.CONFLICT,
        "A care plan already exists & active for this patient!",
      );
    }
    let shift_count = 0;
    if (carePlanType === "ONE_OFF") {
      shift_count = carePlanShift.length;
    } else if (carePlanType === "WEEKLY") {
      shift_count =
        dayOfWeek.length * carePlanShift.length * payload.durationOfWeek;
    }

    // Calculate actual total possible shifts based on care plan configuration

    // ✅ 4. Create care plan
    const result = await prisma.carePlan.create({
      data: {
        ...payload,
        customerId: user.customer.id,
        dayOfWeek: carePlanType === "ONE_OFF" ? [] : dayOfWeek,
        totalShifts: shift_count,
      },
    });

    return result;
  },

  // Get all care plans (admin)
  getAll: async (query: Record<string, unknown>) => {
    const carePlanQuery = new QueryBuilder(prisma.carePlan, query)
      .search(["title", "description"])
      .filter()
      .paginate()
      .select({
        // keep all carePlan fields
        id: true,
        carePlanShift: true,
        carePlanType: true,
        customerId: true,
        dayOfWeek: true,
        description: true,
        durationOfWeek: true,
        patientId: true,
        serviceCategory: true,
        startDate: true,
        status: true,
        supportActivity: true,
        isFullyStaffed: true,
        totalShifts: true,
        title: true,
        careGoals: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
          },
        },
      });

    const [result, meta] = await Promise.all([
      carePlanQuery.execute(),
      carePlanQuery.countTotal(),
    ]);

    return {
      data: result,
      meta,
    };
  },

  // Get care plans for specific customer
  getMy: async (query: Record<string, unknown>, userId: string) => {
    const customer = await prisma.customer.findUnique({ where: { userId } });
    const customerId = customer?.id;

    const carePlanQuery = new QueryBuilder(prisma.carePlan, query)
      .search(["title", "description"])
      .filter()
      .rawFilter({ customerId })
      .paginate()
      .select({
        // keep all carePlan fields
        id: true,
        carePlanShift: true,
        carePlanType: true,
        customerId: true,
        dayOfWeek: true,
        description: true,
        durationOfWeek: true,
        patientId: true,
        serviceCategory: true,
        startDate: true,
        status: true,
        supportActivity: true,
        isFullyStaffed: true,
        totalShifts: true,
        title: true,
        careGoals: true,
        createdAt: true,
        updatedAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
          },
        },
      });

    const [result, meta] = await Promise.all([
      carePlanQuery.execute(),
      carePlanQuery.countTotal(),
    ]);

    // if (!result.length) {
    //     throw new ApiError(status.NOT_FOUND, "No care plans found!");
    // }

    // 🧮 Add shift count for each care plan
    const updatedResult = result.map((plan: any) => ({
      ...plan,
      shiftCount: plan.shifts?.length || 0,
    }));

    return {
      data: updatedResult,
      meta,
    };
  },

  carePlanDetails: async (id: string) => {
    const result = await prisma.carePlan.findUnique({
      where: { id },
      include: {
        shifts: {
          select: {
            id: true,
            staff: {
              select: {
                id: true,
                serviceCategory: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImage: true,
                    email: true,
                  },
                },
              },
            },
            shiftType: true,
            startDateTime: true,
            endDateTime: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            age: true,
            gender: true,
          },
        },
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "Care plan not found!");
    }

    const shiftCount = result.shifts.length;

    const shifts = result.shifts.map((shift: any) => ({
      shiftId: shift.id,
      serviceCategory: shift.staff.serviceCategory,
      userId: shift.staff.user.id,
      staffId: shift.staff.id,
      firstName: shift.staff.user.firstName,
      lastName: shift.staff.user.lastName,
      profileImage: shift.staff.user.profileImage,
      email: shift.staff.user.email,
      shiftType: shift.shiftType,
      startDateTime: shift.startDateTime,
      endDateTime: shift.endDateTime,
      status: shift.status,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }));

    const unassignedShifts = await ShiftService.getUnassignedShifts(id);

    return {
      ...result,
      shifts,
      unassignedShifts,
      shiftCount,
    };
  },

  update: async (id: string, payload: Partial<CarePlan>, userId: string) => {
    // 2️⃣ Find existing care plan
    const existingCarePlan = await prisma.carePlan.findUnique({
      where: {
        id,
      },
    });

    if (!existingCarePlan) {
      throw new ApiError(status.NOT_FOUND, "Care plan not found!");
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true, user: { select: { role: true } } },
    });

    if (
      customer?.id !== existingCarePlan.customerId &&
      customer?.user?.role !== UserRole.ADMIN
    ) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You cannot update this care plan.",
      );
    }

    // 4️⃣ Overlap check (if date/days updated)
    const startDate = payload.startDate ?? existingCarePlan.startDate;
    const dayOfWeek = payload.dayOfWeek ?? existingCarePlan.dayOfWeek;
    const carePlanType = payload.carePlanType ?? existingCarePlan.carePlanType;

    if (payload.startDate || payload.dayOfWeek) {
      const overlappingPlan = await prisma.carePlan.findFirst({
        where: {
          patientId: payload.patientId,
          status: CarePlanStatus.ACTIVE,
        },
      });

      if (overlappingPlan) {
        throw new ApiError(
          status.CONFLICT,
          "A care plan already exists & active for this patient!",
        );
      }
    }

    // 5️⃣ Update care plan
    const result = await prisma.carePlan.update({
      where: { id },
      data: {
        title: payload.title ?? existingCarePlan.title,
        description: payload.description ?? existingCarePlan.description,
        carePlanType,
        startDate,
        dayOfWeek,
        status: payload.status ?? existingCarePlan.status,
        serviceCategory:
          payload.serviceCategory ?? existingCarePlan.serviceCategory,
        supportActivity:
          payload.supportActivity ?? existingCarePlan.supportActivity,
        careGoals: payload.careGoals ?? existingCarePlan.careGoals,
      },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return result;
  },

  // Delete care plan
  //   delete: async (id: string, userId: string) => {
  //     console.log(id);
  //     console.log(userId);

  //     const customer = await prisma.customer.findUnique({
  //       where: {
  //         userId,
  //       },
  //       select: {
  //         id: true,
  //       },
  //     });
  //     console.log(customer);

  //     // If customerId is provided, ensure the care plan belongs to this customer
  //     // if (!customer) {
  //     //   throw new ApiError(status.NOT_FOUND, "User not found!");
  //     // }

  //     const existingCarePlan = await prisma.carePlan.findUnique({
  //       where: {
  //         id,
  //       },
  //     });

  //     if (!existingCarePlan) {
  //       throw new ApiError(status.NOT_FOUND, "Care plan not found!");
  //     }

  //     const actionRole = await prisma.user.findUnique({
  //       where: { id: userId },
  //       select: { role: true },
  //     });

  //     if (!actionRole) {
  //       throw new ApiError(status.NOT_FOUND, "User not found!");
  //     }

  //     console.log(actionRole);

  //     if (
  //       !customer ||
  //       (customer.id !== existingCarePlan.customerId &&
  //       actionRole.role !== "ADMIN")
  //     ) {
  //       throw new ApiError(status.UNAUTHORIZED, "You Cannot Delete it");
  //     }

  //     await prisma.carePlan.delete({ where: { id } });

  //     return {
  //       message: "Care plan deleted successfully!",
  //     };
  //   },

  // Delete care plan
  delete: async (id: string, userId: string) => {
    // console.log("Deleting care plan:", { id, userId });

    // 1. First, verify the user exists and get their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    // 2. Get the care plan
    const existingCarePlan = await prisma.carePlan.findUnique({
      where: { id },
    });

    if (!existingCarePlan) {
      throw new ApiError(status.NOT_FOUND, "Care plan not found!");
    }

    // console.log("User:", user);
    // console.log("Care plan:", existingCarePlan);

    // 3. Authorization check
    const customerId = user.customer?.id;
    const isAdmin = user.role === "ADMIN";
    const isOwner = customerId === existingCarePlan.customerId;

    // If user is neither admin nor the owner, deny access
    if (!isAdmin && !isOwner) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to delete this care plan",
      );
    }

    // Additional check: Non-admin must be the customer owner
    if (!isAdmin && !isOwner) {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You can only delete your own care plans",
      );
    }

    // 4. Delete the care plan
    await prisma.carePlan.delete({ where: { id } });

    return {
      message: "Care plan deleted successfully!",
    };
  },
};
