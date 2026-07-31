import status from "http-status";
import {
  User,
  UserRole,
  UserStatus,
  Staff,
  Address,
  ShiftType,
  Customer,
  Patient,
  ShiftStatus,
  ShiftRequestStatus,
  Shift,
  ServiceCategory,
} from "@prisma/client";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import bcrypt from "bcrypt";
import { sendOTP } from "../../utils/sendOTP";
import { CreateReviewPayload, UserUpdatePayload } from "./user.interface";

export const UserService = {
  registerAsCustomer: async (payload: Customer & User & Address) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (user && user.isVerified) {
      return {
        statusCode: status.PERMANENT_REDIRECT,
        success: true,
        message: "You already have an account! Please Login",
        redirectTo: "login",
      };
    }

    if (user && !user.isVerified) {
      const res = await sendOTP(user.id);
      return {
        statusCode: status.PERMANENT_REDIRECT,
        message: `${res.message}!verify your account!`,
        redirectTo: "verify-otp-signup",
      };
    }
    // hash password
    const hashedPassword = await bcrypt.hash(payload.password ?? "", 10);

    // Prisma transaction: create User, Customer, and Address
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: hashedPassword,
          phoneNumber: payload.phoneNumber ?? null,
          role: UserRole.CUSTOMER,
          gender: payload.gender,
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          bio: payload.bio,
          isAdult: payload.isAdult ?? true,
          supportFor: payload.supportFor ?? "FAMILY_MEMBER",
          haveFunding: payload.haveFunding ?? false,
        },
      });

      const address = await tx.address.create({
        data: {
          userId: user.id,
          state: payload.state ?? null,
          city: payload.city ?? null,
          postcode: payload.postcode ?? null,
          latitude: payload.latitude,
          longitude: payload.longitude,
          country: payload.country,
        },
      });

      return { user, customer, address };
    });
    const res = await sendOTP(result.user.id);
    return {
      message: res.message,
    };
  },

  registerAsStaff: async (payload: Staff & User & Address) => {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (user && user.isVerified) {
      return {
        statusCode: status.PERMANENT_REDIRECT,
        success: true,
        message: "You already have an account! Please Login",
        redirectTo: "login",
      };
    }

    if (user && !user.isVerified) {
      const res = await sendOTP(user.id);
      return {
        statusCode: status.PERMANENT_REDIRECT,
        message: `${res.message}!verify your account!`,
        redirectTo: "verify-otp-signup",
      };
    }

    const hashedPassword = await bcrypt.hash(payload.password ?? "", 10);

    // Function to set default times based on shift types
    const getShiftTimes = (shiftTypes: ShiftType[] | undefined | null) => {
      if (!shiftTypes || shiftTypes.length === 0) {
        return {
          startTime: payload.startTime ?? null,
          endTime: payload.endTime ?? null,
        };
      }

      // Define shift time ranges
      const shiftTimeRanges = {
        [ShiftType.MORNING]: { start: "06:00", end: "14:00" }, // 6 AM - 2 PM
        [ShiftType.EVENING]: { start: "14:00", end: "22:00" }, // 2 PM - 10 PM
        [ShiftType.NIGHT]: { start: "22:00", end: "06:00" }, // 10 PM - 6 AM
      };

      // If specific times are provided, use them
      if (payload.startTime && payload.endTime) {
        return {
          startTime: payload.startTime,
          endTime: payload.endTime,
        };
      }

      // For single shift type, use its specific times
      if (shiftTypes.length === 1) {
        const shift = shiftTimeRanges[shiftTypes[0]];
        return {
          startTime: shift.start,
          endTime: shift.end,
        };
      }

      // For multiple shifts, calculate the widest range
      let earliestStart = "23:59";
      let latestEnd = "00:00";

      shiftTypes.forEach((shiftType) => {
        const shift = shiftTimeRanges[shiftType];
        if (shift.start < earliestStart) earliestStart = shift.start;
        if (shift.end > latestEnd) latestEnd = shift.end;
      });

      // Handle overnight shifts (night shift ends next day)
      if (shiftTypes.includes(ShiftType.NIGHT)) {
        latestEnd = "23:59"; // Max end time for night shifts
      }

      return {
        startTime: earliestStart,
        endTime: latestEnd,
      };
    };

    // Get calculated times based on shift types
    const { startTime, endTime } = getShiftTimes(payload.shiftType);

    // Prisma transaction: create User, Staff, and Address
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          password: hashedPassword,
          phoneNumber: payload.phoneNumber ?? null,
          role: UserRole.STAFF,
          gender: payload.gender,
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: user.id,
          age: payload.age,
          bio: payload.bio,
          hourlyRate: payload.hourlyRate,
          serviceCategory: payload.serviceCategory ?? [],
          skills: payload.skills ?? [],
          availabilityHours: payload.availabilityHours,
          dayOfWeek: payload.dayOfWeek ?? [],
          shiftType: payload.shiftType,
          languages: payload.languages ?? [],
          travelDistance: payload.travelDistance,
          startTime: startTime,
          endTime: endTime,
          experienceYears: payload.experienceYears ?? null,
          totalWorkTime: payload.totalWorkTime ?? null,
          certifications: payload.certifications ?? [],
        },
      });

      const address = await tx.address.create({
        data: {
          userId: user.id,
          state: payload.state ?? null,
          city: payload.city ?? null,
          postcode: payload.postcode ?? null,
          latitude: payload.latitude,
          longitude: payload.longitude,
          country: payload.country,
        },
      });

      return { user, staff, address };
    });

    const res = await sendOTP(result.user.id);
    return {
      message: res.message,
      shiftInfo: {
        shiftTypes: payload.shiftType,
        calculatedStartTime: startTime,
        calculatedEndTime: endTime,
      },
    };
  },

  getAllUserFromDB: async (query: Record<string, unknown>) => {
    if (query.isBlocked === "true") {
      query.isBlocked = true;
    } else if (query.isBlocked === "false") {
      query.isBlocked = false;
    }
    const userQuery = new QueryBuilder(prisma.user, {
      ...query,
      ...(query.role ? {} : { role: { not: UserRole.ADMIN } }),
    })
      .search(["firstName", "email", "lastName"])
      .filter()
      .paginate();

    const [result, meta] = await Promise.all([
      userQuery.execute(),
      userQuery.countTotal(),
    ]);

    // Remove password from each user
    const data = result.map((user: User) => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      meta,
      data,
    };
  },

  updateAdmin: async (userId: string, payload: Partial<User>) => {
    const existingAdmin = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
      },
    });

    if (!existingAdmin) {
      throw new ApiError(status.NOT_FOUND, "Admin not found!");
    }

    const result = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: payload.firstName ?? existingAdmin.firstName,
        lastName: payload.lastName ?? existingAdmin.lastName,
        profileImage: payload.profileImage ?? existingAdmin.profileImage,
        phoneNumber: payload.phoneNumber ?? existingAdmin.phoneNumber,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  },
  updateProfile: async (userId: string, payload: UserUpdatePayload) => {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        address: true,
      },
    });

    if (!existingUser) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (existingUser.status === UserStatus.BLOCKED) {
      throw new ApiError(status.NOT_FOUND, "User is Blocked!");
    }
    // // if profile image not in then, seed
    // if (!payload.profileImage) {
    //   payload.profileImage = existingUser.profileImage;
    // }

    const result = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName ?? existingUser.firstName,
        lastName: payload.lastName ?? existingUser.firstName,
        profileImage: payload.profileImage ?? existingUser.profileImage,
        address: {
          update: {
            where: {
              id: existingUser.address[0].id,
            },
            data: {
              city: payload.city ?? existingUser.address[0].city,
              country: payload.country ?? existingUser.address[0].country,
              postcode: payload.postcode ?? existingUser.address[0].postcode,
              state: payload.state ?? existingUser.address[0].state,
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        role: true,
        address: {
          select: {
            city: true,
            country: true,
            state: true,
            postcode: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...result,
      ...result.address[0],
      address: undefined,
    };
  },
  getUserById: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        staff: true,
        customer: true,
        address: true,
      },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(status.NOT_FOUND, "User is Blocked!");
    }

    const { password, ...rest } = user;

    return rest;
  },
  getMyProfile: async (email: string) => {
    const result = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        role: true,
        phoneNumber: true,
        gender: true,
        status: true,
        staff: true,
        customer: true,
        address: true,
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "Profile Not Found!");
    }

    return result;
  },

  deleteUser: async (userId: string) => {
    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }
    if (isUserExist.status === UserStatus.BLOCKED) {
      throw new ApiError(status.NOT_FOUND, "User is Blocked!");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return null;
  },

  blockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found to block!");
    }
    if (user.status === UserStatus.BLOCKED) {
      throw new ApiError(status.NOT_FOUND, "User is Blocked!");
    }
    if (user.role === UserRole.ADMIN) {
      throw new ApiError(status.FORBIDDEN, "You cannot block an admin!");
    }
    const result = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.BLOCKED },
    });

    return result;
  },

  unblockUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    const result = await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE },
    });

    return result;
  },

  // Create a review
  createReview: async (userId: string, payload: CreateReviewPayload) => {
    // console.log(userId);

    const isUserExist = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!isUserExist) {
      throw new ApiError(status.NOT_FOUND, "User not found!");
    }

    // console.log(payload.staffId);

    const isSpecialistExist = await prisma.user.findUnique({
      where: { id: payload.staffId },
    });

    if (!isSpecialistExist) {
      throw new ApiError(status.NOT_FOUND, "Specialist not found!");
    }

    // console.log(payload);

    const result = await prisma.review.create({
      data: {
        ...payload,
        userId: userId,
      },
    });

    return result;
  },

  // userDashboardStats: async (userId: string) => {
  //   const customer = await prisma.customer.findUnique({
  //     where: { userId },
  //     select: { id: true },
  //   });

  //   if (!customer) {
  //     return {
  //       onGoingShiftCount: 0,
  //       patientCount: 0,
  //       assignedStaff: 0,
  //     };
  //   }

  //   // console.log(customer);

  //   // Count patients directly
  //   const patientCount = await prisma.patient.count({
  //     where: { customerId: customer.id },
  //   });

  //   // Count ongoing shifts directly
  //   const onGoingShiftCount = await prisma.shift.count({
  //     where: {
  //       patient: { customerId: customer.id },
  //       status: ShiftStatus.IN_PROGRESS,
  //     },
  //   });

  //   // Use groupBy instead of distinct
  //   const grouped = await prisma.shiftRequest.groupBy({
  //     by: ["staffId"],
  //     where: {
  //       requestedBy: customer.id,
  //       shiftRequestStatus: ShiftRequestStatus.ACCEPTED,
  //     },
  //   });

  //   const uniqueCount = grouped.length;

  //   // console.log(uniqueCount);

  //   const shifts = await prisma.shift.findMany({
  //     where: {
  //       patient: { customerId: customer.id },
  //       staffId: { not: null }, // Filter out null staffId
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     select: {
  //       startDateTime: true,
  //       carePlan: {
  //         select: {
  //           serviceCategory: true,
  //           patient: {
  //             select: {
  //               firstName: true,
  //               lastName: true,
  //             },
  //           },
  //         },
  //       },
  //       staff: {
  //         select: {
  //           user: {
  //             select: {
  //               firstName: true,
  //               lastName: true,
  //               profileImage: true,
  //               email: true,
  //             },
  //           },
  //         },
  //       },
  //       status: true,
  //     },
  //   });

  //   // Add filter to ensure staff is not null before mapping
  //   const organizedShifts = shifts
  //     .filter((shift: any) => shift.staff !== null && shift.staff.user !== null) // Add this line
  //     .map((shift: any) => ({
  //       staff: {
  //         firstName: shift.staff.user.firstName,
  //         lastName: shift.staff.user.lastName,
  //         email: shift.staff.user.email,
  //         profileImage: shift.staff.user.profileImage,
  //       },
  //       patient: {
  //         firstName: shift.carePlan.patient.firstName,
  //         lastName: shift.carePlan.patient.lastName,
  //       },
  //       serviceCategory: shift.carePlan.serviceCategory[0],
  //       date: shift.startDateTime,
  //       status: shift.status,
  //     }));

  //   return {
  //     onGoingShiftCount,
  //     patientCount,
  //     assignedStaff: uniqueCount,
  //     shifts: organizedShifts,
  //   };
  // },

  userDashboardStats: async (
    userId: string,
    pagination?: { page: number; limit: number },
  ) => {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!customer) {
      return {
        onGoingShiftCount: 0,
        patientCount: 0,
        assignedStaff: 0,
        shifts: [],
        pagination: {
          page: 1,
          limit: pagination?.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Set default pagination values
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Count patients directly
    const patientCount = await prisma.patient.count({
      where: { customerId: customer.id },
    });

    // Count ongoing shifts directly
    const onGoingShiftCount = await prisma.shift.count({
      where: {
        patient: { customerId: customer.id },
        status: ShiftStatus.IN_PROGRESS,
      },
    });

    // Use groupBy instead of distinct
    const grouped = await prisma.shiftRequest.groupBy({
      by: ["staffId"],
      where: {
        requestedBy: customer.id,
        shiftRequestStatus: ShiftRequestStatus.ACCEPTED,
      },
    });

    const uniqueCount = grouped.length;

    // Get total count of shifts for pagination
    const totalShifts = await prisma.shift.count({
      where: {
        patient: { customerId: customer.id },
        staffId: { not: null },
      },
    });

    // Fetch shifts with pagination
    const shifts = await prisma.shift.findMany({
      where: {
        patient: { customerId: customer.id },
        staffId: { not: null },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: limit,
      select: {
        startDateTime: true,
        carePlan: {
          select: {
            serviceCategory: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
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
                profileImage: true,
                email: true,
              },
            },
          },
        },
        status: true,
      },
    });

    // Add filter to ensure staff is not null before mapping
    const organizedShifts = shifts
      .filter((shift: any) => shift.staff !== null && shift.staff.user !== null)
      .map((shift: any) => ({
        staff: {
          firstName: shift.staff.user.firstName,
          lastName: shift.staff.user.lastName,
          email: shift.staff.user.email,
          profileImage: shift.staff.user.profileImage,
        },
        patient: {
          firstName: shift.carePlan.patient.firstName,
          lastName: shift.carePlan.patient.lastName,
        },
        serviceCategory: shift.carePlan.serviceCategory[0],
        date: shift.startDateTime,
        status: shift.status,
      }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalShifts / limit);

    return {
      onGoingShiftCount,
      patientCount,
      assignedStaff: uniqueCount,
      shifts: organizedShifts,
      pagination: {
        page,
        limit,
        total: totalShifts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
};
