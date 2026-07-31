import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { getMyNotifications } from "./notification.service";
import sendResponse from "../../helpers/sendResponse";
import status from 'http-status'



export const myNotifications = catchAsync(async (req: Request, res: Response) => {
    const result = await getMyNotifications(req.user.id);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "My Notifications fetched successfully!",
        data: result,
    });
});