import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../helpers/sendResponse";
import { getImageUrl } from "../../helpers/fileUploader";
import { UserRole } from "@prisma/client";

export const UserController = {
  registerAsCustomer: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.registerAsCustomer(req.body);
    sendResponse(res, {
      success: true,
      statusCode: status.CREATED,
      message: "Your account created successfully!",
      data: result,
    });
  }),
  registerAsStaff: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.registerAsStaff(req.body);
    sendResponse(res, {
      success: true,
      statusCode: status.CREATED,
      message: "Your account created successfully!",
      data: result,
    });
  }),

  getAllUser: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getAllUserFromDB(req.query);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Users are retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const { id, role } = req.user;
    if (req.file) {
      req.body.profileImage = await getImageUrl(req.file as any);
    }
    let result;

    if (role === UserRole.ADMIN) {
      result = await UserService.updateAdmin(id, req.body);
    } else {
      result = await UserService.updateProfile(id, req.body);
    }
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User updated successfully!",
      data: result,
    });
  }),

  getUserById: catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await UserService.getUserById(userId);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User retrieved successfully!",
      data: result,
    });
  }),
  getMyProfile: catchAsync(async (req: Request, res: Response) => {
    const email = req.user?.email as string;
    const result = await UserService.getMyProfile(email);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "My profile fetched successfully!",
      data: result,
    });
  }),
  deleteUser: catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;

    await UserService.deleteUser(userId);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User deleted successfully!",
    });
  }),

  blockUser: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await UserService.blockUser(id);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User blocked successfully!",
    });
  }),

  unblockUser: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await UserService.unblockUser(id);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User unblocked successfully!",
    });
  }),

  // Create a review
  createReview: catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const payload = req.body;
    const result = await UserService.createReview(userId, payload);
    sendResponse(res, {
      success: true,
      statusCode: status.CREATED,
      message: "Review created successfully!",
      data: result,
    });
  }),
  // dashboardStats: catchAsync(async (req: Request, res: Response) => {
  //   const { id: userId } = req.user;
  //   const result = await UserService.userDashboardStats(userId);
  //   sendResponse(res, {
  //     success: true,
  //     statusCode: status.OK,
  //     message: "Dashboard element fetched successfully!",
  //     data: result
  //   });
  // })

  dashboardStats: catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query; // Get pagination from query params

    const result = await UserService.userDashboardStats(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Dashboard element fetched successfully!",
      data: result,
    });
  }),
};
