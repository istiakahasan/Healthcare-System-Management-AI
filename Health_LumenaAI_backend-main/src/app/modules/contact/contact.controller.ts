import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { ContactService } from "./contact.service";
import sendResponse from "../../helpers/sendResponse";

// Create contact
const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContact(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact created successfully",
    data: result,
  });
});

// Get all contacts
const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder } = req.query;
  const paginationOptions = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as string) || "desc",
  };
  const result = await ContactService.getAllContacts(paginationOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contacts fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Get single contact
const getContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getContact(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact fetched successfully",
    data: result,
  });
});

// Delete contact
const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.deleteContact(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Contact deleted successfully",
    data: result,
  });
});

export const ContactController = {
  createContact,
  getAllContacts,
  getContact,
  deleteContact,
};
