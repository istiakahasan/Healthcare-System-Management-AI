import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { ShiftService } from "./shift.service";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status"

export const ShiftController = {
  
    sendShiftRequest: catchAsync(async (req: Request, res: Response) => {
        await ShiftService.sendShiftRequest(req.body, req.user.id);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Your Shift Request has been sent!",
        });
    }),
    myShiftRequest: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.myShiftRequest(req.user.id);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "My Shift requests retrieved successfully",
            data: result
        });
    }),
    shiftRequestDetails: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.shiftRequestDetails(req.params.id);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "My Shift request retrieved successfully",
            data: result
        });
    }),
    acceptShiftRequest: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.acceptShiftRequest(req.params.id);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Shift request accepted successfully",
            data: result
        });
    }),
    rejectShiftRequest: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.rejectShiftRequest(req.params.id, req.body.declineReason);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Shift request rejected successfully",
            data: result
        });
    }),
    shiftDetails: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.shiftDetails(req.params.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Shift details fetched successfully",
            data: result
        });
    }),
    myShifts: catchAsync(async (req: Request, res: Response) => {
        const result = await ShiftService.myShifts(req.user.id, req.query);
        if (Array.isArray(result)) {
            sendResponse(res, {
                success: true,
                statusCode: status.OK,
                message: "My shifts retrieved successfully",
                data: result,
            });
            return;
        }
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "My shifts retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    }),
}