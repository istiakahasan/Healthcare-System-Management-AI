import { Request, Response } from "express";
import { PatientService } from "./patient.service"; // adjust path as needed
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import status from "http-status"
export const PatientController = {
    add: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.add(req.user.id,req.body);
        sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Patient added successfully!",
            data: result,
        });
    }),

    patientDetails: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.patientDetails(req.params.id);

        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Patient fetched successfully!",
            data: result,
        });
    }),

    getAll: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.getAll(req.query);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Patients fetched successfully!",
            data: result.data,
            meta: result.meta,
        });
    }),
    getMy: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.getMy(req.query, req.user.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "My Patients fetched successfully!",
            data: result.data,
            meta: result.meta,
        });
    }),

    update: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.update(req.params.id, req.body);

        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Patient updated successfully!",
            data: result,
        });
    }),

    delete: catchAsync(async (req: Request, res: Response) => {
        const result = await PatientService.delete(req.params.id);
        sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Patient deleted successfully!",
            data: result,
        });
    }),
};
