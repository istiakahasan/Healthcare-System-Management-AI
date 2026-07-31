import {
  ShiftRequestStatus,
  ShiftStatus,
  StaffStatus,
  UserRole,
} from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import status from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import { MONTHS } from "./admin.utils";
import httpStatus from "http-status";
export const AdminService = {
  getDashboardStats: async () => {
    const [totalUsers, activeStaff, pendingVerifications, ongoingShifts] =
      await Promise.all([
        prisma.user.count({
          where: {
            role: { not: UserRole.ADMIN },
          },
        }),
        prisma.staff.count({
          where: {
            staffStatus: StaffStatus.ACTIVE,
          },
        }),
        prisma.staff.count({
          where: {
            staffStatus: StaffStatus.INACTIVE,
          },
        }),
        prisma.shift.count({
          where: {
            status: ShiftStatus.IN_PROGRESS,
          },
        }),
      ]);
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1️⃣ Fetch all shifts in the current year
    const shifts = await prisma.shift.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
      },
      select: {
        createdAt: true,
      },
    });

    // 2️⃣ Initialize monthly shift count map
    const monthlyShiftMap: Record<string, number> = {};
    MONTHS.forEach((month) => (monthlyShiftMap[month] = 0));

    // 3️⃣ Count shifts per month
    shifts.forEach((shift) => {
      const monthIndex = shift.createdAt.getMonth();
      const monthName = MONTHS[monthIndex];
      monthlyShiftMap[monthName] += 1;
    });

    // 4️⃣ Prepare chart data
    const chartData = MONTHS.map((month) => ({
      month,
      shifts: monthlyShiftMap[month],
    }));

    return {
      totalUsers,
      activeStaff,
      pendingVerifications,
      ongoingShifts,
      chartData,
    };
  },
  getAdminDashboardStatsOfUsers: async () => {
    const [totalRegisteredUser, activeStaff, activeClient, lastWeekSignUp] =
      await Promise.all([
        prisma.user.count({
          where: {
            role: { not: UserRole.ADMIN },
          },
        }),
        prisma.staff.count({
          where: {
            staffStatus: StaffStatus.ACTIVE,
          },
        }),
        prisma.customer.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago from now
            },
          },
        }),
      ]);

    return {
      totalRegisteredUser,
      activeStaff,
      activeClient,
      lastWeekSignUp,
    };
  },

  // getPendingUserList: async () => {
 getPendingUserList: async (options?: { page?: number; limit?: number }) => {
  const defaultOptions = {
    page: 1,
    limit: 10,
    ...options,
  };

  const queryObj = {
    staffStatus: StaffStatus.INACTIVE,
    ...defaultOptions,
  };

  const pendingUser = new QueryBuilder(prisma.staff, queryObj)
    .paginate()
    .filter()
    .select({
      id: true,
      age: true,
      availabilityHours: true,
      bio: true,
      certifications: true,
      dayOfWeek: true,
      endTime: true,
      experienceYears: true,
      hourlyRate: true,
      languages: true,
      serviceCategory: true,
      shiftType: true,
      skills: true,
      staffStatus: true,
      serviceAvailability: true,
      startTime: true,
      totalWorkTime: true,
      travelDistance: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
          isVerified: true,
          phoneNumber: true,
        },
      },
    });

  const [data, meta] = await Promise.all([
    pendingUser.execute(),
    pendingUser.countTotal(),
  ]);

  const flattenedData = data.map((item: any) => ({
    // From User relation
    id: item.user.id,
    firstName: item.user.firstName,
    lastName: item.user.lastName,
    email: item.user.email,
    profileImage: item.user.profileImage,
    role: item.user.role,
    isVerified: item.user.isVerified,
    phoneNumber: item.user.phoneNumber,

    // From Staff
    staffId: item.id,
    age: item.age,
    availabilityHours: item.availabilityHours,
    bio: item.bio,
    certifications: item.certifications,
    dayOfWeek: item.dayOfWeek,
    endTime: item.endTime,
    experienceYears: item.experienceYears,
    hourlyRate: item.hourlyRate,
    languages: item.languages,
    serviceCategory: item.serviceCategory,
    shiftType: item.shiftType,
    skills: item.skills,
    staffStatus: item.staffStatus,
    serviceAvailability: item.serviceAvailability,
    startTime: item.startTime,
    totalWorkTime: item.totalWorkTime,
    travelDistance: item.travelDistance,
    createdAt: item.createdAt,
  }));

  return {
    meta,
    data: flattenedData,
  };
},

  approveStaff: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found Here!");
    }

    const result = await prisma.staff.update({
      where: {
        userId,
        staffStatus: StaffStatus.INACTIVE,
      },
      data: {
        staffStatus: StaffStatus.ACTIVE,
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_ACCEPTABLE, "Bad request!");
    }

    return result;
  },
  rejectStaff: async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found Here!");
    }

    const result = await prisma.staff.update({
      where: {
        userId,
        staffStatus: StaffStatus.INACTIVE,
      },
      data: {
        staffStatus: StaffStatus.REJECTED,
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_ACCEPTABLE, "Bad request!");
    }

    return result;
  },

  recentShifts: async (query: Record<string, unknown>) => {
    const shiftQuery = new QueryBuilder(prisma.shift, {
      ...query,
      orderBy: { createdAt: "desc" },
    })
      .select({
        id: true,
        createdAt: true,
        status: true,
        staff: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        carePlan: {
          select: {
            serviceCategory: true,
            customer: {
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
        },
      })
      .paginate();

    const [result, meta] = await Promise.all([
      shiftQuery.execute(),
      shiftQuery.countTotal(),
    ]);

    // 🧩 Flatten the structure
    const formattedData = result.map((shift: any) => ({
      id: shift.id,
      createdAt: shift.createdAt,
      status: shift.status,
      staff: {
        firstName: shift.staff?.user?.firstName || "",
        lastName: shift.staff?.user?.lastName || "",
        email: shift.staff?.user?.email || "",
        profileImage: shift.staff?.user?.profileImage || "",
      },
      customer: {
        firstName: shift.carePlan?.customer?.user?.firstName || "",
        lastName: shift.carePlan?.customer?.user?.lastName || "",
      },
      serviceCategory: shift.carePlan?.serviceCategory || [],
    }));

    return {
      meta,
      data: formattedData,
    };
  },

  getAllShifts: async (query: Record<string, unknown>) => {
    const shiftQuery = new QueryBuilder(prisma.shift, query)
      .search(["staff.user.firstName", "staff.user.lastName"])
      .select({
        id: true,
        createdAt: true,
        status: true,
        staff: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        carePlan: {
          select: {
            serviceCategory: true,
            customer: {
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
        },
      })
      .filter()
      .paginate();

    const [result, meta] = await Promise.all([
      shiftQuery.execute(),
      shiftQuery.countTotal(),
    ]);

    // 🧩 Flatten the structure
    const formattedData = result.map((shift: any) => ({
      id: shift.id,
      createdAt: shift.createdAt,
      status: shift.status,
      staff: {
        firstName: shift.staff?.user?.firstName || "",
        lastName: shift.staff?.user?.lastName || "",
        email: shift.staff?.user?.email || "",
        profileImage: shift.staff?.user?.profileImage || "",
      },
      customer: {
        firstName: shift.carePlan?.customer?.user?.firstName || "",
        lastName: shift.carePlan?.customer?.user?.lastName || "",
      },
      serviceCategory: shift.carePlan?.serviceCategory || [],
    }));

    return {
      meta,
      data: formattedData,
    };
  },

  // Delete Shifts
  deleteShifts: async (id: string, userId: string) => {
    const isShiftsExist = await prisma.shift.findUnique({
      where: {
        id,
      },
    });

    if (!isShiftsExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
    }

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    if (isUserExist.role !== "ADMIN") {
      throw new ApiError(
        status.UNAUTHORIZED,
        "You are not authorized to delete this shift",
      );
    }

    const result = await prisma.shift.delete({
      where: {
        id,
      },
    });

    return result;
  },

  // Shifts overview
  shiftsOverview: async () => {
    const totalShifts = await prisma.shift.count({});

    // Count unique staff members (distinct staff) with accepted shift requests
    // const assignedStaffInShift = await prisma.shiftRequest.aggregate({
    //   where: {
    //     shiftRequestStatus: ShiftRequestStatus.ACCEPTED,
    //   },
    //   _count: {
    //     _all: true,
    //   },
    //   // To get distinct staff count, we need to use groupBy first
    // });

    // Alternative approach for distinct staff count
    const distinctStaffCount = await prisma.shiftRequest.groupBy({
      by: ["staffId"],
      where: {
        shiftRequestStatus: ShiftRequestStatus.ACCEPTED,
      },
      _count: {
        staffId: true,
      },
    });

    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const shiftsCompletedInThisMonth = await prisma.shift.count({
      where: {
        status: ShiftStatus.COMPLETED,
        // Add date filter for this month only (use createdAt)
        updatedAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const totalCancelShifts = await prisma.shift.count({
      where: {
        status: ShiftStatus.CANCELLED,
      },
    });

    return {
      totalShifts,
      //   assignedStaffInShiftLength: assignedStaffInShift,
      assignedStaffInShift: distinctStaffCount.length, // Count of distinct staff members
      shiftsCompletedInThisMonth,
      totalCancelShifts,
    };
  },

  // All Contact Support with pagination
  allContactSupport: async (query: any) => {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    // Build where conditions for filtering
    const where: any = {};

    // Add filters if provided
    if (query?.category) {
      where.category = query.category;
    }

    if (query?.search) {
      where.OR = [
        {
          subject: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: query.search,
            mode: "insensitive",
          },
        },
        {
          user: {
            OR: [
              {
                firstName: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.contactSupport.count({
      where,
    });

    // Get paginated data
    const data = await prisma.contactSupport.findMany({
      where,
      select: {
        id: true,
        category: true,
        image: true,
        message: true,
        subject: true,
        createdAt: true,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  },
};
