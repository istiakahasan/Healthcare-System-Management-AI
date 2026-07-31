import { Request, Response } from "express";
import { CarePlanService } from "./carePlan.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status";

export const CarePlanController = {
    add: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.add(req.user.id, req.body);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Care plan created successfully!",
            data: result,
        });
    }),

    carePlanDetails: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.carePlanDetails(req.params.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Care plan Details loaded successfully!",
            data: result,
        });
    }),

    getAll: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.getAll(req.query);

        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Care plans fetched successfully!",
            data: result.data,
            meta: result.meta,
        });
    }),

    getMy: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.getMy(req.query, req.user.id);

        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "My care plans fetched successfully!",
            data: result.data,
            meta: result.meta,
        });
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.update(req.params.id, req.body, req.user.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Care plan updated successfully!",
            data: result,
        });
    }),


    delete: catchAsync(async (req: Request, res: Response) => {
        const result = await CarePlanService.delete(req.params.id,req.user.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Care plan deleted successfully!",
            data: result,
        });
    }),
};