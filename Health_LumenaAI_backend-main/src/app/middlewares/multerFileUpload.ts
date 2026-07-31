// import multer from "multer";
// import path from "path";

// const storage = multer.memoryStorage();

// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, path.join(process.cwd(), "public", "uploads"));
// //   },
// //   filename: function (req, file, cb) {
// //     const uniqueSuffix = `${Date.now()}`;
// //     const ext = path.extname(file.originalname);
// //     const baseName = path.basename(file.originalname, ext);
// //     cb(null, `${baseName}-${uniqueSuffix}${ext}`);
// //   },
// // });

// const upload = multer({ storage: storage });

// const audio = upload.single("audio");

// // Upload single images

// // const chatImage = upload.single("chatImage");

// const completeWorkDocuments = upload.fields([
//   { name: "signature", maxCount: 1 },
//   { name: "beforePhoto", maxCount: 10 },
//   { name: "afterPhoto", maxCount: 10 },
// ]);
// // ✅ Upload single files
// const avatar = upload.single("avatar");
// const chatImage = upload.single("chatImage");
// const doc = upload.single("doc");
// const jobImage = upload.single("jobImage");

// const docFile = upload.single("docFile");

// const profileUpdateFields = upload.fields([
//   { name: "profileImage", maxCount: 1 },
//   { name: "doc", maxCount: 1 },
// ]);

// export const fileUploader = {
//   avatar,
//   chatImage,
//   audio,
//   profileUpdateFields,
//   jobImage,
//   doc,
//   docFile,
//   completeWorkDocuments,
// };

// #######################################################
import multer from "multer";
import path from "path";
// Multer storage configuration
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const uploadVehicleDoc = upload.fields([
  { name: "insuranceCard", maxCount: 1 },
  { name: "vehicleImage", maxCount: 1 },
]);

// const uploadUserProfileImageAndAllDoc = upload.fields([
//   { name: "profileImages", maxCount: 4 },
//   { name: "incomeImage", maxCount: 1 },
//   { name: "identityImage", maxCount: 1 },
// ]);

const uploadIdentitIncomeImage = upload.fields([
  { name: "incomeImage", maxCount: 1 },
  { name: "identityImage", maxCount: 1 },
]);

const updateProfilePicture = upload.fields([
  { name: "profileImage", maxCount: 1 },
]);

const uploadUserProfileImages = upload.fields([
  { name: "profileImages", maxCount: 7 },
  { name: "image", maxCount: 1 },
]);

const updateProfileImages = upload.fields([
  { name: "profileImages", maxCount: 8 },
  // { name: "image", maxCount: 1 },
]);

const sendMsg = upload.single("fileImage");
const image = upload.single("image");
const voiceFile = upload.single("voiceFile");
const profileImage = upload.single("profileImage");
const introVoiceFile = upload.single("introVoiceFile");
const uploadCategoryIcon = upload.single("categoryIcon");
const uploadProductImage = upload.array("productImage", 5);
const docFile = upload.single("docFile");

// Export file uploader methods
export const fileUploader = {
  upload,
  docFile,
  profileImage,
  uploadVehicleDoc,
  uploadCategoryIcon,
  uploadProductImage,
  sendMsg,
  voiceFile,
  uploadUserProfileImages,
  introVoiceFile,
  uploadIdentitIncomeImage,
  updateProfileImages,
  updateProfilePicture,
  image
};
