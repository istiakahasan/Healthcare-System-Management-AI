import { DocumentCategory } from "@prisma/client";
import prisma from "../../lib/prisma";
import { uploadFileToS3 } from "../../utils/uploadFileToS3";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { formatDate } from "../../utils/formatDate";

// Create Document
const uploadDocument = async (
  userId: string,
  uploadData: {
    category: DocumentCategory;
    patientId: string;
    title: string;
  },
  file: any,
) => {
  // Validate that file exists
  if (!file) {
    throw new Error("File is required");
  }

  console.log(file);

  // Verify patient exists and user has access
  const patient = await prisma.patient.findUnique({
    where: { id: uploadData.patientId },
    include: { customer: true },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  // S3 Bucket Images Uploaded
  let docFileUrl: string;

  const imageFileURL = await uploadFileToS3(file, "documents"); // Changed bucket to "documents" for clarity

  if (!imageFileURL) {
    throw new Error("S3 upload returned no URL");
  }

  docFileUrl = imageFileURL;
  // console.log("File uploaded successfully:", docFileUrl);

  // Create document record
  const document = await prisma.document.create({
    data: {
      title: uploadData.title,
      category: uploadData.category,
      docUrl: docFileUrl,
      patientId: uploadData.patientId,
      userId: userId,
    },
    include: {
      patient: {
        select: { firstName: true, lastName: true },
      },
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  // console.log("Document created successfully:", document.id);

  return document;
};

// Patient all document
const patientAllDocument = async (patientId: string) => {
  // Check patient is exist or not
  const isPatientExist = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
    select: {
      // id: true,
      // firstName: true,
      // lastName: true,
      documents: true,
    },
  });

  if (!isPatientExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Patient not found");
  }

  const finalResult = isPatientExist.documents.map((document) => ({
    ...document,
    postDate: document.createdAt && formatDate(document.createdAt),
  }));

  // return isPatientExist.documents;
  return finalResult;
};

// Wifi Reset
const wifiReset = async () => {
  // const status = "resetting_wifi";
  // return status;
  return {
    status: "resetting_wifi",
  };
};

// Led ON
const ledOn = async () => {
  const result = {
    status: "success",
    led: "on",
  };

  return result;
};

// Value
const valueData = async (value: any) => {
  const result = {
    status: "success",
    received: `${value}`,
  };
  return result;
};

export const DocumentServices = {
  uploadDocument,
  patientAllDocument,
  wifiReset,
  ledOn,
  valueData,
};
