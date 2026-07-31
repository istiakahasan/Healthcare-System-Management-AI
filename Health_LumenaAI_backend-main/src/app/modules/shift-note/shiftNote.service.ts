import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { Prisma, ShiftNoteStatus } from "@prisma/client";
import { formatDate } from "../../utils/formatDate";
import { uploadFileToS3 } from "../../utils/uploadFileToS3";
import { getImageUrl } from "../../utils/uploadFile";

// Create a new Shift note
const createNewShiftNote = async (
  staffId: string,
  // patientId: string,
  payload: any,
  image: any,
) => {
  const isStaffExist = await prisma.user.findUnique({
    where: {
      id: staffId,
    },
  });

  if (!isStaffExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff Not Found");
  }

  const isPatientExist = await prisma.patient.findUnique({
    where: {
      id: payload.patientId,
    },
    select: {
      id: true,
      customerId: true,
      customer: {
        select: {
          id: true,
          userId: true,
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!isPatientExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Staff Not Found");
  }

  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("incident", payload.incident);
  formData.append("concern", payload.concern);
  formData.append("raw_notes", payload.rawNotes);

  // S3 Bucket Images Uploaded
  let imageFileUrl: string | undefined;

  // const imageFileUrl = image && (await getImageUrl(image));

  if (image) {
    const fileBuffer = fs.readFileSync(image.path);
    formData.append("image", fileBuffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });

    // console.log(image);

    const imageFile = await uploadFileToS3(image, "documents"); // Changed bucket to "documents" for clarity

    if (!imageFile) {
      throw new Error("S3 upload returned no URL");
    }

    imageFileUrl = imageFile;
  }

  try {
    const response = await axios.post(
      `${process.env.AI_API}/reports/shift-summary`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "Content-Length": formData.getLengthSync(),
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    const result = await prisma.shiftNote.create({
      data: {
        staffId,
        patientId: payload.patientId,
        customerId: isPatientExist.customer?.userId as string,
        title: payload.title,
        incident: payload.incident,
        concern: payload.concern,
        rawNotes: payload.rawNotes,
        aiSummary: response.data.summary,
        aiImageSummary: response.data.image_summary,
        // image: imageFileUrl ? imageFileUrl : null,
        image: imageFileUrl ?? null,
      },
    });

    return result;
  } catch (error: any) {
    console.error("AI API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Define filter interface
export interface ShiftNoteFilters {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  searchTerm?: string; // Search in title, description, incident, concerns
}

// Define pagination options interface
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Response interface
export interface ShiftNoteResponse {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get All Shift Notes with Pagination & Filtering
const getAllShiftNotes = async (
  filters: ShiftNoteFilters = {},
  paginationOptions: PaginationOptions = {},
): Promise<ShiftNoteResponse> => {
  const { status, searchTerm } = filters;

  const { page = 1, limit = 10 } = paginationOptions;

  // Calculate skip
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ShiftNoteWhereInput = {};

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search term filter
  if (searchTerm) {
    // Use OR condition to search across staff firstName and lastName
    where.OR = [
      // Search in staff firstName
      {
        staff: {
          firstName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Search in staff lastName
      {
        staff: {
          lastName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Also search in shift note fields if needed
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        rawNotes: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        incident: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [result, total] = await Promise.all([
    prisma.shiftNote.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        aiSummary: true,
        adminNote: true,
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.shiftNote.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const finalResult = result.map((note) => ({
    ...note,
    createdAt: formatDate(note.createdAt),
  }));

  return {
    data: finalResult,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

// Get Single Shift note
const getSingleShiftNote = async (id: string) => {
  const isShiftNoteExist = await prisma.shiftNote.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      rawNotes: true,
      aiSummary: true,
      aiImageSummary: true,
      image: true,
      status: true,
      adminNote: true,
    },
  });

  if (!isShiftNoteExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift Note Note Found");
  }

  return isShiftNoteExist;
};

// Change Shift Note Status
const changeShiftNoteStatus = async (
  id: string,
  status: any,
  adminNote: string,
) => {
  const isShiftNoteExist = await prisma.shiftNote.findUnique({
    where: {
      id,
    },
  });

  if (!isShiftNoteExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift Note Found");
  }

  const validStatuses = ["APPROVED", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Shift Note must be ${ShiftNoteStatus.APPROVED} or ${ShiftNoteStatus.REJECTED}.`,
    );
  }

  if (isShiftNoteExist.status === status) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      `Shift note status already ${status}`,
    );
  }

  if (!adminNote) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Must provide admin note");
  }

  const result = await prisma.shiftNote.update({
    where: {
      id,
    },
    data: {
      status,
      adminNote,
    },
  });

  return result;
};

// Customer all Shift Notes
const customerAllShiftNotes = async (
  customerId: string,
  filters: ShiftNoteFilters = {},
  paginationOptions: PaginationOptions = {},
): Promise<ShiftNoteResponse> => {
  const { status, searchTerm } = filters;

  const { page = 1, limit = 10 } = paginationOptions;

  // Calculate skip
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ShiftNoteWhereInput = {
    customerId,
  };

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search term filter
  if (searchTerm) {
    // Use OR condition to search across staff firstName and lastName
    where.OR = [
      // Search in staff firstName
      {
        staff: {
          firstName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Search in staff lastName
      {
        staff: {
          lastName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Also search in shift note fields if needed
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        rawNotes: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        incident: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [result, total] = await Promise.all([
    prisma.shiftNote.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        aiSummary: true,
        adminNote: true,
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.shiftNote.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const finalResult = result.map((note) => ({
    ...note,
    createdAt: formatDate(note.createdAt),
  }));

  return {
    data: finalResult,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

// Staff all Shift Notes
const staffAllShiftNotes = async (
  staffId: string,
  filters: ShiftNoteFilters = {},
  paginationOptions: PaginationOptions = {},
): Promise<ShiftNoteResponse> => {
  const { status, searchTerm } = filters;

  const { page = 1, limit = 10 } = paginationOptions;

  // Calculate skip
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ShiftNoteWhereInput = {
    staffId,
  };

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search term filter
  if (searchTerm) {
    // Use OR condition to search across staff firstName and lastName
    where.OR = [
      // Search in staff firstName
      {
        staff: {
          firstName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Search in staff lastName
      {
        staff: {
          lastName: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      },
      // Also search in shift note fields if needed
      {
        title: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        rawNotes: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      {
        incident: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
    ];
  }

  const [result, total] = await Promise.all([
    prisma.shiftNote.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        aiSummary: true,
        adminNote: true,
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.shiftNote.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const finalResult = result.map((note) => ({
    ...note,
    createdAt: formatDate(note.createdAt),
  }));

  return {
    data: finalResult,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const ShiftNoteServices = {
  createNewShiftNote,
  getAllShiftNotes,
  getSingleShiftNote,
  changeShiftNoteStatus,
  customerAllShiftNotes,
  staffAllShiftNotes,
};
