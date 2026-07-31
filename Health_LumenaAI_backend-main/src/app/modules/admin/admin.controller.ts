import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { AdminService } from "./admin.service";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status";

export const AdminController = {
  getDashboardStats: catchAsync(async (req: Request, res: Response) => {
    const data = await AdminService.getDashboardStats();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Admin dashboard stats loaded successfully!",
      data,
    });
  }),
  getAdminDashboardStatsOfUsers: catchAsync(
    async (req: Request, res: Response) => {
      const data = await AdminService.getAdminDashboardStatsOfUsers();
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Admin dashboard stats for user loaded successfully!",
        data,
      });
    },
  ),

  getPendingUser: catchAsync(async (req: Request, res: Response) => {
    // Get pagination and search from query params
    const { page = 1, limit = 10, searchTerm, ...otherFilters } = req.query;

    const data = await AdminService.getPendingUserList({
      page: Number(page),
      limit: Number(limit)
      // searchTerm: searchTerm as string,
      // ...otherFilters, // Pass other filters if any
    });

    // const data = await AdminService.getPendingUserList();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Pending users fetched successfully!",
      data,
    });
  }),

  approveStaff: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await AdminService.approveStaff(id);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Staff request accepted!",
    });
  }),
  rejectStaff: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await AdminService.rejectStaff(id);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Staff request rejected!",
    });
  }),
  recentShifts: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.recentShifts(req.query);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Recent Shifts fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  }),
  getAllShifts: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.getAllShifts(req.query);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "All Shifts fetched successfully!",
      data: result.data,
      meta: result.meta,
    });
  }),
  deleteShifts: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.deleteShifts(req.params.id, req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Shift Deleted successfully!",
      data: result,
    });
  }),
  // Shifts overview
  shiftsOverview: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.shiftsOverview();

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Shifts overview retrieved successfully!",
      data: result,
      //   meta: result.meta,
    });
  }),

  // All Contact Support
  allContactSupport: catchAsync(async (req: Request, res: Response) => {
    const result = await AdminService.allContactSupport(req.query);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "All Contact Supports retrieved successfully!",
      data: result,
      //   meta: result.meta,
    });
  }),
};
