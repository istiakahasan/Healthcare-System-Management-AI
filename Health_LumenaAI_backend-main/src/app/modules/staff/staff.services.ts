import { GenderEnum, LanguageEnum, StaffStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { formatDate, formatTime } from "../../utils/formatDate";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import {
  calculateDistance,
  calculateStaffAvailability,
  matchAge,
  matchGender,
  MATCHING_WEIGHTS,
  matchShift,
  scoreAvailabilityEnhanced,
  scoreDistance,
  scoreLanguage,
  scoreSkills,
  StaffScore,
} from "./staff.utils";
import { MatchStaffInput } from "./staff.validation";

// Profile Details
const profileDetails = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      email: true,
      role: true,
    },
  });

  return result;
};

const matchStaffWithMCDM = async (payload: any): Promise<StaffScore[]> => {
  const { carePlanId, languages, min_age, max_age } = payload;
  // console.log("payload(findStaff)", payload);

  // Fetch care plan
  const carePlan = await prisma.carePlan.findUnique({
    where: { id: carePlanId },
    select: {
      carePlanType: true,
      dayOfWeek: true,
      startDate: true,
      title: true,
      status: true,
      careGoals: true,
      supportActivity: true,
      serviceCategory: true,
      carePlanShift: true,
      totalShifts: true,
      patient: {
        select: {
          age: true,
          gender: true,
          address: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  if (!carePlan) {
    throw new Error("Care Plan not found!");
  }

  // Get location coordinates
  const patientLat = carePlan.patient?.address?.[0]?.latitude;
  const patientLon = carePlan.patient?.address?.[0]?.longitude;

  if (patientLat == null || patientLon == null) {
    throw new Error("Location coordinates not found for care plan!");
  }
  // Fetch active staff
  const staffList = await prisma.staff.findMany({
    where: {
      staffStatus: StaffStatus.ACTIVE,
      serviceCategory: {
        hasSome: carePlan.serviceCategory,
      },
      shiftType: {
        hasSome: carePlan.carePlanShift,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          gender: true,
          profileImage: true,
          role: true,
          address: {
            select: {
              latitude: true,
              longitude: true,
              city: true,
            },
          },
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });
  // console.log("staffs",staffList)

  // Calculate scores for each staff member
  const scoredStaff: StaffScore[] = await Promise.all(
    staffList.map(async (staff) => {
      const staffLat = staff.user.address[0]?.latitude;
      const staffLon = staff.user.address[0]?.longitude;

      const distance = calculateDistance(
        patientLat!,
        patientLon!,
        staffLat!,
        staffLon!,
      );

      const languageScore = scoreLanguage(staff.languages, languages);
      const skillsScore = scoreSkills(staff.skills, carePlan.supportActivity);
      const distanceScore = scoreDistance(distance, staff.travelDistance);
      const availabilityScore = scoreAvailabilityEnhanced(staff, carePlan);
      const ageScore = matchAge(min_age, max_age, String(staff.age));
      const genderScore = matchGender(payload.gender, staff.user.gender);
      const shiftScore = matchShift(staff.shiftType, carePlan.carePlanShift);
      // ✅ Await the async function
      const staffAvailableIn = await calculateStaffAvailability(
        carePlanId,
        staff.id,
      );
      const availability =
        Math.round((staffAvailableIn / carePlan.totalShifts) * 100) + "%";

      const totalScore =
        ageScore * MATCHING_WEIGHTS.age +
        genderScore * MATCHING_WEIGHTS.gender +
        languageScore * MATCHING_WEIGHTS.language +
        skillsScore * MATCHING_WEIGHTS.skills +
        distanceScore * MATCHING_WEIGHTS.distance +
        shiftScore * MATCHING_WEIGHTS.shift +
        availabilityScore * MATCHING_WEIGHTS.availability;

      return {
        id: staff.id,
        firstName: staff.user.firstName,
        lastName: staff.user.lastName,
        email: staff.user.email,
        totalScore: Math.round(totalScore * 100) / 100,
        matchQuality: `${Math.round(totalScore * 100)}%`,
        profileImage: staff.user.profileImage,
        role: staff.user.role,
        bio: staff.bio,
        gender: staff.user.gender,
        availabilityHours: staff.availabilityHours,
        age: staff.age,
        experienceYears: staff.experienceYears,
        serviceCategory: staff.serviceCategory,
        skills: staff.skills,
        shiftType: staff.shiftType,
        certifications: staff.certifications,
        languages: staff.languages,
        travelDistance: staff.travelDistance,
        clientStaffDistance: Math.round(distance),
        hourlyRate: staff.hourlyRate,
        breakdown: {
          language: Math.round(languageScore * 100) / 100,
          skills: Math.round(skillsScore * 100) / 100,
          distance: Math.round(distanceScore * 100) / 100,
          availability: Math.round(availabilityScore * 100) / 100,
          age: Math.round(ageScore * 100) / 100,
          gender: Math.round(genderScore * 100) / 100,
          shiftScore: Math.round(shiftScore * 100) / 100,
        },
        averageRating:
          staff.reviews.length > 0
            ? staff.reviews.reduce((sum: any, r: any) => sum + r.rating, 0) /
              staff.reviews.length
            : 0,
        totalReviews: staff.reviews.length,
        staffAvailableIn, // include it if you want
        availability,
      };
    }),
  );

  // Sort by total score (descending)
  // ✅ Filter out staff with staffAvailableIn < 1, then sort by total score
  return scoredStaff
    .filter((staff: any) => staff.staffAvailableIn >= 1)
    .sort((a, b) => b.totalScore - a.totalScore);
};

const matchedStaffDetails = async (
  staffId: string,
  // payload: MatchStaffInput,
  // payload: any
) => {
  // const { gender, carePlanId, languages, min_age, max_age } = payload;

  // Fetch care plan
  // const carePlan = await prisma.carePlan.findUnique({
  //   where: { id: carePlanId },
  //   select: {
  //     carePlanType: true,
  //     dayOfWeek: true,
  //     startDate: true,
  //     title: true,
  //     status: true,
  //     careGoals: true,
  //     supportActivity: true,
  //     serviceCategory: true,
  //     carePlanShift: true,
  //     totalShifts: true,
  //     patient: {
  //       select: {
  //         age: true,
  //         gender: true,
  //         address: {
  //           select: {
  //             latitude: true,
  //             longitude: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // if (!carePlan) {
  //   throw new Error("Care Plan not found!");
  // }

  // // Get location coordinates
  // const patientLat = carePlan.patient?.address?.[0]?.latitude;
  // const patientLon = carePlan.patient?.address?.[0]?.longitude;

  // if (patientLat == null || patientLon == null) {
  //   throw new Error("Location coordinates not found for care plan!");
  // }

  const staff = await prisma.staff.findUnique({
    where: {
      id: staffId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          gender: true,
          profileImage: true,
          role: true,
          address: {
            select: {
              latitude: true,
              longitude: true,
              city: true,
            },
          },
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff Not Found!");
  }

  console.log(staff);

  const staffLat = staff.user.address[0]?.latitude;
  const staffLon = staff.user.address[0]?.longitude;

  // const distance = calculateDistance(
  //   patientLat!,
  //   patientLon!,
  //   staffLat!,
  //   staffLon!
  // );

  // const languageScore = scoreLanguage(staff.languages, languages);
  // const skillsScore = scoreSkills(staff.skills, carePlan.supportActivity);
  // const distanceScore = scoreDistance(distance, staff.travelDistance);
  // const availabilityScore = scoreAvailabilityEnhanced(staff, carePlan);
  // const ageScore = matchAge(min_age, max_age, String(staff.age));
  // const genderScore = matchGender(payload.gender, staff.user.gender);
  // const shiftScore = matchShift(staff.shiftType, carePlan.carePlanShift);
  // // ✅ Await the async function
  // const staffAvailableIn = await calculateStaffAvailability(
  //   carePlanId,
  //   staff.id
  // );
  // const availability =
  //   Math.round((staffAvailableIn / carePlan.totalShifts) * 100) + "%";

  // const totalScore =
  //   ageScore * MATCHING_WEIGHTS.age +
  //   genderScore * MATCHING_WEIGHTS.gender +
  //   languageScore * MATCHING_WEIGHTS.language +
  //   skillsScore * MATCHING_WEIGHTS.skills +
  //   distanceScore * MATCHING_WEIGHTS.distance +
  //   shiftScore * MATCHING_WEIGHTS.shift +
  //   availabilityScore * MATCHING_WEIGHTS.availability;

  return {
    id: staff.id,
    userId: staff.user.id,
    firstName: staff.user.firstName,
    lastName: staff.user.lastName,
    email: staff.user.email,
    gender: staff.user.gender,
    // totalScore: Math.round(totalScore * 100) / 100,
    // matchQuality: `${Math.round(totalScore * 100)}%`,
    profileImage: staff.user.profileImage,
    role: staff.user.role,
    bio: staff.bio,
    availabilityHours: staff.availabilityHours,
    age: staff.age,
    experienceYears: staff.experienceYears,
    serviceCategory: staff.serviceCategory,
    skills: staff.skills,
    shiftType: staff.shiftType,
    certifications: staff.certifications,
    languages: staff.languages,
    travelDistance: staff.travelDistance,
    // clientStaffDistance: Math.round(distance),
    hourlyRate: staff.hourlyRate,
    breakdown: {
      // language: Math.round(languageScore * 100) / 100,
      // skills: Math.round(skillsScore * 100) / 100,
      // distance: Math.round(distanceScore * 100) / 100,
      // availability: Math.round(availabilityScore * 100) / 100,
      // age: Math.round(ageScore * 100) / 100,
      // gender: Math.round(genderScore * 100) / 100,
      // shiftScore: Math.round(shiftScore * 100) / 100,
    },
    averageRating:
      staff.reviews.length > 0
        ? staff.reviews.reduce((sum: any, r: any) => sum + r.rating, 0) /
          staff.reviews.length
        : 0,
    totalReviews: staff.reviews.length,
    // staffAvailableIn, // include it if you want
    // availability,
  };
};

// Get My Profile
const getMyProfile = async (userId: string) => {
  const result = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      email: true,
      phoneNumber: true,
      gender: true,
      address: {
        select: {
          state: true,
          city: true,
          country: true,
          postcode: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
      staff: {
        select: {
          id: true,
          serviceCategory: true,
          bio: true,
          experienceYears: true,
          languages: true,
          qualification: true,
          certifications: true,
          dayOfWeek: true,
        },
      },
    },
  });

  return result;
};

// Update Specialist Profile
const updateSpecialistProfile = async (
  userId: string,
  updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    bio?: string;
    experienceYears?: number;
    gender?: GenderEnum;
    expertise?: string[];
    certificates?: string[]; // Array of certificate file paths/URLs
    // languages?: string[];
    languages?: LanguageEnum[];
    address?: {
      state?: string;
      city?: string;
      country?: string;
      postcode?: string;
      latitude?: number;
      longitude?: number;
    };
  },
) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    bio,
    experienceYears,
    expertise,
    certificates,
    languages,
    address,
    gender,
  } = updateData;

  // console.log(updateData);

  // Start a transaction to update multiple related records
  const result = await prisma.$transaction(async (tx) => {
    // Update basic user information
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phoneNumber && { phoneNumber }),
        ...(gender && { gender }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        phoneNumber: true,
        profileImage: true,
      },
    });

    // Update specialist profile
    const updatedSpecialist = await tx.staff.update({
      where: { userId },
      data: {
        ...(bio && { bio }),
        ...(experienceYears && { experienceYears }),
        ...(expertise && { expertise }),
        ...(languages && { languages }),
        // ...(certificates && { certificates }),
      },
      select: {
        id: true,
        bio: true,
        experienceYears: true,
        // certificates: true,
        languages: true,
        serviceCategory: true,
      },
    });

    // Update or create address using upsert (Option 1 - Recommended)
    if (address) {
      // First, check if an address already exists for this user
      const existingAddress = await tx.address.findFirst({
        where: { userId },
      });

      if (existingAddress) {
        // Update existing address
        await tx.address.update({
          where: { id: existingAddress.id },
          data: {
            ...(address.state !== undefined && { state: address.state }),
            ...(address.city !== undefined && { city: address.city }),
            ...(address.country !== undefined && { country: address.country }),
            ...(address.postcode !== undefined && {
              postcode: address.postcode,
            }),
            ...(address.latitude !== undefined && {
              latitude: address.latitude,
            }),
            ...(address.longitude !== undefined && {
              longitude: address.longitude,
            }),
          },
        });
      } else {
        // Create new address
        await tx.address.create({
          data: {
            state: address.state || null,
            city: address.city || null,
            country: address.country || "",
            postcode: address.postcode || null,
            latitude: address.latitude !== undefined ? address.latitude : 0,
            longitude: address.longitude !== undefined ? address.longitude : 0,
            userId: userId,
          },
        });
      }
    }

    // Get the complete updated address
    const updatedAddress = await tx.address.findFirst({
      where: { userId },
      select: {
        state: true,
        city: true,
        country: true,
        postcode: true,
        latitude: true,
        longitude: true,
      },
    });

    return {
      ...updatedUser,
      specialist: updatedSpecialist,
      address: updatedAddress,
    };
  });

  return result;
};

// Update or added profile image
const updateOrAddedProfileImage = async (userId: string, file: any) => {
  // Validate input
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!file) {
    throw new Error("File is required");
  }

  // Update user's profile image in database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profileImage: file.location,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      email: true,
    },
  });

  return updatedUser;
};

// Create Contact Support
const createContactSupport = async (
  userId: string,
  payload: any,
  file: any,
) => {
  const result = await prisma.contactSupport.create({
    data: {
      ...payload,
      image: file?.location,
      userId: userId,
    },
  });

  return result;
};

// Get All Review
const allReview = async (userId: string, ratingFilter?: number) => {
  // Base query conditions
  const whereCondition: any = { staffId: userId };
  //   console.log(userId);

  // Apply rating filter if provided
  if (ratingFilter && [1, 2, 3, 4, 5].includes(ratingFilter)) {
    whereCondition.rating = ratingFilter;
  }

  // Get reviews with user data
  const reviews = await prisma.review.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  //   console.log(reviews);

  // Get statistics from database aggregation (more efficient)
  const stats = await prisma.review.groupBy({
    by: ["rating"],
    where: { staffId: userId },
    _count: {
      rating: true,
    },
    having: {
      rating: {
        in: [1, 2, 3, 4, 5],
      },
    },
  });

  const totalReviews = stats.reduce((acc, curr) => acc + curr._count.rating, 0);
  const weightedSum = stats.reduce(
    (acc, curr) => acc + curr.rating * curr._count.rating,
    0,
  );
  const averageRating =
    totalReviews > 0 ? Number((weightedSum / totalReviews).toFixed(1)) : 0;

  const ratingCounts = {
    rating_5: stats.find((s) => s.rating === 5)?._count.rating ?? 0,
    rating_4: stats.find((s) => s.rating === 4)?._count.rating ?? 0,
    rating_3: stats.find((s) => s.rating === 3)?._count.rating ?? 0,
    rating_2: stats.find((s) => s.rating === 2)?._count.rating ?? 0,
    rating_1: stats.find((s) => s.rating === 1)?._count.rating ?? 0,
  };

  // const totalReviews = stats._count._all;
  // const averageRating = stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0;

  const ratingDistribution = {
    fiveStar: ratingCounts.rating_5 ?? 0,
    fourStar: ratingCounts.rating_4 ?? 0,
    threeStar: ratingCounts.rating_3 ?? 0,
    twoStar: ratingCounts.rating_2 ?? 0,
    oneStar: ratingCounts.rating_1 ?? 0,
  };

  // const ratingPercentages = {
  //     fiveStar: totalReviews > 0 ? Number(((ratingDistribution.fiveStar / totalReviews) * 100).toFixed(1)) : 0,
  //     fourStar: totalReviews > 0 ? Number(((ratingDistribution.fourStar / totalReviews) * 100).toFixed(1)) : 0,
  //     threeStar: totalReviews > 0 ? Number(((ratingDistribution.threeStar / totalReviews) * 100).toFixed(1)) : 0,
  //     twoStar: totalReviews > 0 ? Number(((ratingDistribution.twoStar / totalReviews) * 100).toFixed(1)) : 0,
  //     oneStar: totalReviews > 0 ? Number(((ratingDistribution.oneStar / totalReviews) * 100).toFixed(1)) : 0
  // };

  // Format reviews with reviewedDate
  const formattedReviews = reviews.map((review) => ({
    ...review,
    reviewedDate: formatDate(review.createdAt),
  }));

  return {
    statistics: {
      totalReviews,
      averageRating,
      ratingDistribution,
      // ratingPercentages
    },
    reviews: formattedReviews,
  };
};

// Get all client list with pagination and filters
const getAllClientList = async (
  userId: string,
  filters: {
    status?: "ACTIVE" | "PAST" | "UPCOMING";
    page?: number;
    limit?: number;
    search?: string;
  },
) => {
  const { status, page = 1, limit = 10, search } = filters;

  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: true,
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff not found");
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Build where clause for status filter
  const whereClause: any = {
    staffId: isUserExist.staff?.id,
    shiftRequestStatus: "ACCEPTED",
  };

  if (search) {
    whereClause.OR = [
      {
        carePlan: {
          customer: {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      },
    ];
  }

  // Add status filter based on date comparison
  const currentDate = new Date();
  console.log(status);

  if (status === "ACTIVE") {
    whereClause.AND = [
      { startDate: { lte: currentDate } },
      { endDate: { gte: currentDate } },
    ];
  } else if (status === "PAST") {
    whereClause.endDate = { lt: currentDate };
  } else if (status === "UPCOMING") {
    whereClause.startDate = { gt: currentDate };
  }

  // Get total count for pagination
  const total = await prisma.shiftRequest.count({
    where: whereClause,
  });

  const result = await prisma.shiftRequest.findMany({
    where: whereClause,
    select: {
      id: true,
      shiftRequestStatus: true,
      // startDate: true, // Added for status calculation
      // endDate: true, // Added for status calculation
      carePlan: {
        select: {
          id: true,
          serviceCategory: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  address: {
                    select: {
                      city: true,
                      state: true,
                      latitude: true,
                      longitude: true,
                      country: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc", // Order by start date
    },
    skip,
    take: limit,
  });

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
    data: result,
  };
};

// Single Client List
const singleClientDetails = async (clientId: string) => {
  const result = await prisma.shiftRequest.findUnique({
    where: {
      id: clientId,
    },
    select: {
      id: true,
      // carePlanId: true,
      carePlan: {
        select: {
          id: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  about: true,
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
            },
          },
          patient: true,
        },
      },
    },
  });

  return result;
};

// Get Top Rated Staff
const getTopRatedStaff = async () => {
  // Step 1: Get all reviews with staffId
  const allReviews = await prisma.review.findMany({
    where: {
      staffId: {
        not: null,
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      careType: true,
      staffId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // If no reviews found, return empty result
  if (allReviews.length === 0) {
    return {
      success: true,
      statusCode: 200,
      message: "No staff reviews found",
      data: {
        topRatedStaff: [],
        totalStaffWithReviews: 0,
      },
    };
  }

  // Step 2: Group reviews by staffId and calculate statistics
  const staffRatingsMap = new Map<
    string,
    {
      ratings: number[];
      // reviews: typeof allReviews;
    }
  >();

  allReviews.forEach((review) => {
    if (review.staffId) {
      if (!staffRatingsMap.has(review.staffId)) {
        staffRatingsMap.set(review.staffId, {
          ratings: [],
          // reviews: []
        });
      }
      const staffData = staffRatingsMap.get(review.staffId)!;
      staffData.ratings.push(review.rating);
      // staffData.reviews.push(review);
    }
  });

  // Step 3: Calculate average ratings for each staff
  const staffWithAverages = Array.from(staffRatingsMap.entries()).map(
    ([staffId, data]) => {
      const totalRating = data.ratings.reduce((sum, rating) => sum + rating, 0);
      const averageRating = totalRating / data.ratings.length;

      return {
        staffId,
        averageRating: Number(averageRating.toFixed(2)),
        totalReviews: data.ratings.length,
        ratings: data.ratings,
        // reviews: data.reviews
      };
    },
  );

  // Step 4: Sort by average rating (descending) and total reviews (secondary sort)
  const sortedStaff = staffWithAverages.sort((a, b) => {
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    return b.totalReviews - a.totalReviews;
  });

  // Step 5: Get top 5 staff
  const top5StaffIds = sortedStaff.slice(0, 5).map((s) => s.staffId);

  // Step 6: Fetch full staff details with user information
  const staffDetails = await prisma.user.findMany({
    where: {
      id: {
        in: top5StaffIds,
      },
    },
  });

  // Step 7: Build final response with proper ordering
  const topRatedStaff = top5StaffIds
    .map((staffId) => {
      const staff = staffDetails.find((s) => s.id === staffId);
      const statsData = sortedStaff.find((s) => s.staffId === staffId);

      if (!staff || !statsData) return null;

      // Calculate rating distribution
      // const ratingDistribution = {
      //     fiveStar: statsData.ratings.filter(r => r === 5).length,
      //     fourStar: statsData.ratings.filter(r => r === 4).length,
      //     threeStar: statsData.ratings.filter(r => r === 3).length,
      //     twoStar: statsData.ratings.filter(r => r === 2).length,
      //     oneStar: statsData.ratings.filter(r => r === 1).length
      // };

      return {
        id: staff.id,
        staffDetails: {
          firstName: staff.firstName || "",
          lastName: staff.lastName || "",
          email: staff.email || "",
          profileImage: staff.profileImage || "",
          role: staff.role || "",
        },
        ratingStats: {
          averageRating: statsData.averageRating,
          totalReviews: statsData.totalReviews,
          // ratingDistribution
        },
        // recentReviews: statsData.reviews
        //     .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        //     .slice(0, 3)
        //     .map(review => ({
        //         id: review.id,
        //         rating: review.rating,
        //         comment: review.comment,
        //         careType: review.careType,
        //         createdAt: review.createdAt.toISOString(),
        //         reviewedDate: new Date(review.createdAt).toLocaleDateString('en-US', {
        //             year: 'numeric',
        //             month: 'short',
        //             day: 'numeric'
        //         })
        //     }))
      };
    })
    .filter(Boolean);

  return topRatedStaff;
};

// Upcoming Shifts - Only future shifts
const upcomingShifts = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isUserExist.staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff profile not found");
  }

  const currentDate = new Date();

  const staffRequest = await prisma.shiftRequest.findMany({
    where: {
      staffId: isUserExist.staff.id,
      carePlan: {
        startDate: {
          gt: currentDate, // Only shifts with start date in the future
        },
      },
      // shiftRequestStatus: {
      //     in: ['APPROVED', 'PENDING'] // Only include approved or pending shifts
      // }
    },
    select: {
      id: true,
      shiftRequestStatus: true,
      carePlan: {
        select: {
          id: true,
          serviceCategory: true,
          startDate: true,
          // endDate: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      carePlan: {
        startDate: "asc", // Order by nearest shift first
      },
    },
  });

  console.log(staffRequest);

  const finalResult = staffRequest.map((staff) => ({
    id: staff.id,
    shiftRequestStatus: staff.shiftRequestStatus,
    serviceCategory: staff.carePlan.serviceCategory,
    customer: staff.carePlan.customer,
    startDate: staff.carePlan.startDate,
    shiftDate: formatDate(staff.carePlan.startDate),
    shiftTime: formatTime(staff.carePlan.startDate),
  }));

  return finalResult;
};

// Completed Shifts - Only past shifts
const completedShifts = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isUserExist.staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff profile not found");
  }

  const currentDate = new Date();

  const staffRequest = await prisma.shiftRequest.findMany({
    where: {
      staffId: isUserExist.staff.id,
      carePlan: {
        startDate: {
          lt: currentDate, // Only shifts with start date in the past
        },
      },
      // shiftRequestStatus: {
      //     in: ['COMPLETED', 'APPROVED'] // Include completed and approved shifts that are in the past
      // }
    },
    select: {
      id: true,
      shiftRequestStatus: true,
      carePlan: {
        select: {
          serviceCategory: true,
          startDate: true,
          // endDate: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      carePlan: {
        startDate: "desc", // Order by most recent completed shifts first
      },
    },
  });

  const finalResult = staffRequest.map((staff) => ({
    id: staff.id,
    shiftRequestStatus: staff.shiftRequestStatus,
    serviceCategory: staff.carePlan.serviceCategory,
    customer: staff.carePlan.customer,
    startDate: staff.carePlan.startDate,
    // endDate: staff.carePlan.endDate,
    shiftDate: formatDate(staff.carePlan.startDate),
    shiftTime: formatTime(staff.carePlan.startDate),
    // duration: staff.carePlan.endDate ?
    //     calculateDuration(staff.carePlan.startDate, staff.carePlan.endDate) : null,
    isCompleted: true,
  }));

  return finalResult;
};

// Recent Feedback
const getRecentFeedback = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isUserExist.staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff profile not found");
  }

  // console.log(isUserExist);

  const result = await prisma.review.findMany({
    where: {
      staffId: isUserExist.id,
    },
    select: {
      id: true,
      careType: true,
      comment: true,
      rating: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    // take: 5, // Use 'take' instead of 'limit' in Prisma
  });

  const finalResult = result.map((review) => ({
    ...review,
    createdAt: review.createdAt && formatDate(review.createdAt),
  }));

  return finalResult;
};

//Today's Schedule
const todaysSchedule = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isUserExist.staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff profile not found");
  }

  const currentDate = new Date();

  // Get start and end of today
  const startOfToday = new Date(currentDate);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(currentDate);
  endOfToday.setHours(23, 59, 59, 999);
  // console.log(isUserExist);

  const staffRequest = await prisma.shift.findMany({
    where: {
      staffId: isUserExist.staff.id,
      carePlan: {
        startDate: {
          gte: startOfToday, // Greater than or equal to start of today
          lte: endOfToday, // Less than or equal to end of today
        },
      },
    },
    select: {
      id: true,
      // shiftRequestStatus: true,
      status: true,
      carePlan: {
        select: {
          serviceCategory: true,
          startDate: true,
          customer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      carePlan: {
        startDate: "asc", // Order by nearest shift first
      },
    },
  });

  const finalResult = staffRequest.map((staff) => ({
    id: staff.id,
    // shiftRequestStatus: staff.shiftRequestStatus,
    status: staff.status,
    serviceCategory: staff.carePlan.serviceCategory,
    customer: staff.carePlan.customer,
    startDate: staff.carePlan.startDate,
    shiftDate: formatDate(staff.carePlan.startDate),
    shiftTime: formatTime(staff.carePlan.startDate),
  }));

  return finalResult;
};

// Staff Dashboard overview
const staffDashboardOverview = async (userId: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      staff: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isUserExist.staff) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff profile not found");
  }

  // Base query conditions
  const whereCondition: any = { staffId: userId };

  // Get reviews with user data
  // const reviews = await prisma.review.findMany({
  //   where: whereCondition,
  //   include: {
  //     user: {
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         profileImage: true,
  //       },
  //     },
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  // });

  // Get statistics from database aggregation (more efficient)
  const stats = await prisma.review.groupBy({
    by: ["rating"],
    where: { staffId: userId },
    _count: {
      rating: true,
    },
    having: {
      rating: {
        in: [1, 2, 3, 4, 5],
      },
    },
  });

  const totalReviews = stats.reduce((acc, curr) => acc + curr._count.rating, 0);
  const weightedSum = stats.reduce(
    (acc, curr) => acc + curr.rating * curr._count.rating,
    0,
  );
  const averageRating =
    totalReviews > 0 ? Number((weightedSum / totalReviews).toFixed(1)) : 0;

  const todaysShifts = await todaysSchedule(userId);

  // Get this week's shifts count
  const currentDate = new Date();

  // Get start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of the week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const thisWeekShifts = await prisma.shiftRequest.count({
    where: {
      staffId: isUserExist.staff.id,
      carePlan: {
        startDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    },
  });

  return {
    averageRating,
    todaysShifts: todaysShifts.length,
    thisWeekShifts,
  };
};

export const StaffServices = {
  profileDetails,
  getMyProfile,
  matchedStaffDetails,
  updateSpecialistProfile,
  updateOrAddedProfileImage,
  createContactSupport,
  allReview,
  getAllClientList,
  singleClientDetails,
  getTopRatedStaff,
  upcomingShifts,
  completedShifts,
  getRecentFeedback,
  todaysSchedule,
  staffDashboardOverview,
  matchStaffWithMCDM,
};
