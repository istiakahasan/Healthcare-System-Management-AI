import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { DocumentServices } from "./document.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";

// Upload Document
const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.user;
  // const { category, patientId, title } = req.body;
  const file = req.file;

  const result = await DocumentServices.uploadDocument(userId, req.body, file);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Document uploaded successfully!",
    data: result,
  });
});

// Patient all document
const patientAllDocument = catchAsync(async (req: Request, res: Response) => {
  const { id: patientId } = req.params;

  const result = await DocumentServices.patientAllDocument(patientId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Patient all documents retrieved successfully!",
    data: result,
  });
});

// Wifi Reset
const wifiReset = catchAsync(async (req: Request, res: Response) => {
  // const { id: patientId } = req.params;

  const result = await DocumentServices.wifiReset();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Wifi Reset Data Retrieved successfully",
    data: result,
  });

  // return result
});

// Led On
const ledOn = catchAsync(async (req: Request, res: Response) => {
  // const { id: patientId } = req.params;

  const result = await DocumentServices.ledOn();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Led on Data Retrieved successfully",
    data: result,
  });
});

// Value Data
const valueData = catchAsync(async (req: Request, res: Response) => {
  const { data } = req.query;

  const result = await DocumentServices.valueData(data);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Value Data Retrieved successfully",
    data: result,
  });
});

export const DocumentControllers = {
  uploadDocument,
  patientAllDocument,
  wifiReset,
  ledOn,
  valueData,
};
