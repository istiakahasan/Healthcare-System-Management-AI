import multer from "multer";
import multerS3 from "multer-s3";
import config from "../../config";
import { s3Client } from "./S3Bucket";

// Create multer storage for DigitalOcean Spaces
const s3Storage = multerS3({
  s3: s3Client,
  bucket: config.S3.bucketName || "", // Replace with your bucket name
  acl: "public-read", // Ensure files are publicly accessible
  contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
  key: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // File name in Spaces
  },
});

const imageFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg"];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."),
      false
    );
  }
  cb(null, true);
};

// Upload image configurations
const upload = multer({
  storage: s3Storage,
  // fileFilter: imageFilter, // Apply image filter
});

export const getImageUrl = async (file: Express.MulterS3.File) => {
  let image = file?.location;
  if (!image || !image.startsWith("http")) {
    // image = `https://${config.S3.bucketName}.nyc3.digitaloceanspaces.com/${file?.key}`;
    image = `https://mycvconnect.s3.eu-north-1.amazonaws.com/${file?.key}`;
  }
  return image;
};

// Single image uploads
const uploadProfileImage = upload.single("profileImage");

const uploadThumbnail = upload.single("thumbnail");
// const uploadContactSupportImage = upload.single("image");
const uploadContactSupportImage = upload.single("contactImage");

const uploadCompanyLogoAndPhotos = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "photos", maxCount: 5 },
]);

const uploadCommunitiesPhotoAndVideo = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
const uploadThumbnailAndVideo = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

export const fileUploader = {
  upload,
  uploadProfileImage,
  uploadThumbnail,
  uploadCompanyLogoAndPhotos,
  uploadCommunitiesPhotoAndVideo,
  uploadThumbnailAndVideo,
  uploadContactSupportImage,
};
