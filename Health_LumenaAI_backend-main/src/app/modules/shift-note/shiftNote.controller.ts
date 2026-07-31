import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import {
  PaginationOptions,
  ShiftNoteFilters,
  ShiftNoteServices,
} from "./shiftNote.service";
import sendResponse from "../../helpers/sendResponse";
import httpStatus from "http-status";

// Create a new Shift note
const createNewShiftNote = catchAsync(async (req: Request, res: Response) => {
  const { id: staffId } = req.user;
  const image = req.file;
  
  const result = await ShiftNoteServices.createNewShiftNote(
    staffId,
    req.body,
    image
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Shift Note created successfully",
    data: result,
  });
});

// Get All Shift Notes
const getAllShiftNotes = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters
  const filters: ShiftNoteFilters = {
    status: req.query.status as "PENDING" | "APPROVED" | "REJECTED",
    searchTerm: req.query.searchTerm as string,
  };

  const paginationOptions: PaginationOptions = {
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
  };
  const result = await ShiftNoteServices.getAllShiftNotes(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All Shift Notes retrieved successfully",
    data: result,
  });
});

// Get Single Shift note
const getSingleShiftNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShiftNoteServices.getSingleShiftNote(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Single Shift Note retrieved successfully",
    data: result,
  });
});

// Create a new Shift note
const changeShiftNoteStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const result = await ShiftNoteServices.changeShiftNoteStatus(id, status, adminNote);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Shift Note changed successfully",
      data: result,
    });
  }
);

// Customer all Shift Notes
const customerAllShiftNotes = catchAsync(
  async (req: Request, res: Response) => {
    const { id: customerId } = req.user;

    // Extract query parameters
    const filters: ShiftNoteFilters = {
      status: req.query.status as "PENDING" | "APPROVED" | "REJECTED",
      searchTerm: req.query.searchTerm as string,
    };

    const paginationOptions: PaginationOptions = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };
    const result = await ShiftNoteServices.customerAllShiftNotes(
      customerId,
      filters,
      paginationOptions
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer All Shift Notes retrieved successfully",
      data: result,
    });
  }
);

// Staff all Shift Notes
const staffAllShiftNotes = catchAsync(async (req: Request, res: Response) => {
  const { id: staffId } = req.user;

  // Extract query parameters
  const filters: ShiftNoteFilters = {
    status: req.query.status as "PENDING" | "APPROVED" | "REJECTED",
    searchTerm: req.query.searchTerm as string,
  };

  const paginationOptions: PaginationOptions = {
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
  };

  const result = await ShiftNoteServices.staffAllShiftNotes(
    staffId,
    filters,
    paginationOptions
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Staff All Shift Notes retrieved successfully",
    data: result,
  });
});

export const ShiftNoteControllers = {
  createNewShiftNote,
  getAllShiftNotes,
  getSingleShiftNote,
  changeShiftNoteStatus,
  customerAllShiftNotes,
  staffAllShiftNotes,
};
