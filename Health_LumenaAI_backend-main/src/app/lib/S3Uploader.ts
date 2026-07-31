import path from "path";
import fs from "fs/promises";
import { Readable } from "stream";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../../config";
// import { s3Client } from "./S3Client";
// import { removeFile } from '../../utils/removeFile';
import { s3Client } from "./S3Client";

// **Multipart Upload to DigitalOcean Spaces**
// const uploadToS3 = async (
//   file: Express.Multer.File,
//   folder?: string,
// ): Promise<{ Location: string; Bucket: string; Key: string }> => {
//   if (!file) {
//     throw new Error("File is required for uploading.");
//   }

//   // console.log("Upload to S3");

//   // console.log(file);

//   if (!file.path || !file.mimetype || !file.originalname) {
//     throw new Error("Invalid file data provided.");
//   }
//   const Bucket = config.S3.bucketName || "";
//   const Key = folder
//     ? `bishnukhatri/${folder}/${file.originalname}`
//     : `bishnukhatri/${file.originalname}`;

//   try {
//     const fileBuffer = await fs.readFile(file.path);
//     const command = new PutObjectCommand({
//       Bucket: config.S3.bucketName,
//       Key,
//       Body: fileBuffer,
//       ACL: "public-read",
//       ContentType: file.mimetype,
//     });

//     const uploadResult = await s3Client.send(command);
//     // const { UploadId } = await s3Client.send(createMultipartUpload);

//     if (!uploadResult) {
//       throw new Error("Failed to initiate multipart upload.");
//     }
//     // Remove local file after successful upload
//     // await removeFile(file.path);
//     return {
//       Location: `${config.S3.endpoint}/${Bucket}/${Key}`,
//       // Location: `${Bucket}/${config.S3.endpoint}/${Key}`,
//       //  https://${process.env.DO_SPACE_BUCKET}.nyc3.digitaloceanspaces.com/${file?.key}
//       // Location: `https://s3.sa-east-1.amazonaws.com/${Bucket}/${Key}`,
//       //  Location:`https://${Bucket}.s3.amazonaws.com/${Key}`,
//       Bucket,
//       Key,
//     };
//   } catch (error) {
//     console.error("Error in multipart upload:", error);

//     throw error;
//   }
// };

// **Upload to S3**
const uploadToS3 = async (
  file: Express.Multer.File,
  folder?: string,
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }
  if (!file.path || !file.mimetype || !file.originalname) {
    throw new Error("Invalid file data provided.");
  }

  const Bucket = config.S3.bucketName || "";
  // const Key = folder
  //   ? `kamodoc-images/${folder}/${file.originalname}`
  //   : `kamodoc-images/${file.originalname}`;
  // const Key = folder
  //   ? `${folder}/${file.originalname}`
  //   : `${file.originalname}`;

  const Key = folder
    ? `bishnukhatri/${folder}/${file.originalname}`
    : `bishnukhatri/${file.originalname}`;

  try {
    const fileBuffer = await fs.readFile(file.path);
    const command = new PutObjectCommand({
      Bucket: config.S3.bucketName,
      Key,
      Body: fileBuffer,
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    });

    const uploadResult = await s3Client.send(command);

    if (!uploadResult) {
      throw new Error("Failed to upload file.");
    }

    // Remove local file after successful upload
    // await removeFile(file.path);

    // Correct URL generation based on your S3 provider
    let locationUrl: string;

    if (config.S3.endpoint.includes("digitaloceanspaces.com")) {
      // DigitalOcean Spaces URL format
      locationUrl = `${config.S3.endpoint}/${Key}`;
    } else {
      // AWS S3 URL format (virtual hosted style)
      locationUrl = `https://${Bucket}.s3.${config.S3.region}.amazonaws.com/${Key}`;
    }

    return {
      Location: locationUrl,
      Bucket,
      Key,
    };
  } catch (error) {
    console.error("Error in S3 upload:", error);

    // Clean up local file on error too
    // try {
    //   await removeFile(file.path);
    // } catch (cleanupError) {
    //   console.error("Error cleaning up file:", cleanupError);
    // }

    throw error;
  }
};

// **Abort Multipart Upload (Optional)**
const abortMultipartUpload = async (
  Bucket: string,
  Key: string,
  UploadId: string,
) => {
  try {
    const abortCommand = new AbortMultipartUploadCommand({
      Bucket,
      Key,
      UploadId,
    });
    await s3Client.send(abortCommand);
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
  }
};

// Export file uploader methods
export const S3Uploader = {
  abortMultipartUpload,
  uploadToS3,
};
