import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { StaffServices } from "./staff.services";
import httpStatus from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { MatchStaffInput } from "./staff.validation";

// Profile Details
const profileDetails = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.profileDetails(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile details retrieved successfully",
    data: result,
  });
});

// Get My Profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.getMyProfile(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User profile retrieved successfully",
    data: result,
  });
});
// find staffs
const matchStaff = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const languages = [req.query.languages];
  const finalQuery = {
    ...query,
    languages,
  };
  const result = await StaffServices.matchStaffWithMCDM(finalQuery);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Best Match Staff fetched successfully!",
    data: result,
  });
});

// matched staff details
const matchedStaffDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // const { carePlanId, languages, min_age, max_age } = req.query;

  // const result = await StaffServices.matchedStaffDetails(req.body, id);
  const result = await StaffServices.matchedStaffDetails(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Matched Staff details successfully!",
    data: result,
  });
});

// Update Specialist Profile
const updateSpecialistProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const payload = req.body;

    const result = await StaffServices.updateSpecialistProfile(userId, payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile updated successfully",
      data: result,
    });
  },
);

// Update or added profile image
const updateOrAddedProfileImage = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const file = req.file;
    // console.log(`lashdfalhsdfhasdfh`);

    // console.log(file);

    const result = await StaffServices.updateOrAddedProfileImage(userId, file);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User profile image added or updated successfully",
      data: result,
    });
  },
);

// Create Contact Support
const createContactSupport = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const payload = req.body;
  const file = req.file;

  const result = await StaffServices.createContactSupport(
    userId,
    payload,
    file,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Contact Support Created successfully",
    data: result,
  });
});

// Get All Review
const allReview = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  const { rating } = req.query; // Get rating filter from query params

  // Convert rating to number if provided
  const ratingFilter = rating ? parseInt(rating as string) : undefined;

  const result = await StaffServices.allReview(userId, ratingFilter);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All reviews retrieved successfully",
    data: result,
  });
});

// Get all client list controller
const getAllClientList = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  // Extract query parameters
  const { status, page = 1, limit = 10, search } = req.query;

  // Convert page and limit to numbers
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);

  const result = await StaffServices.getAllClientList(userId, {
    status: status as "ACTIVE" | "PAST" | "UPCOMING",
    page: pageNumber,
    limit: limitNumber,
    search: search as string,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All client lists retrieved successfully",
    data: result,
  });
});

// Single Client List
const singleClientDetails = catchAsync(async (req: Request, res: Response) => {
  // const { id: userId } = req.user;
  const clientId = req.params.id;

  const result = await StaffServices.singleClientDetails(clientId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Single client details retrieved successfully",
    data: result,
  });
});

// Top Rated Staff
const getTopRatedStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffServices.getTopRatedStaff();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Top rated staff retrieved successfully",
    data: result,
  });
});

// Upcoming Shifts
const upcomingShifts = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.upcomingShifts(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Upcoming shifts retrieved successfully",
    data: result,
  });
});

// Completed Shifts
const completedShifts = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.completedShifts(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Completed shifts retrieved successfully",
    data: result,
  });
});

// Recent Feedback
const getRecentFeedback = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.getRecentFeedback(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Recent feedback retrieved successfully",
    data: result,
  });
});

// Todays Schedule
const todaysSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;

  const result = await StaffServices.todaysSchedule(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Today's all Schedule retrieved successfully",
    data: result,
  });
});

// Staff Dashboard overview
const staffDashboardOverview = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user;

    const result = await StaffServices.staffDashboardOverview(userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Staff dashboard overview data retrieved successfully",
      data: result,
    });
  },
);

export const StaffControllers = {
  profileDetails,
  matchStaff,
  matchedStaffDetails,
  getMyProfile,
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
};
