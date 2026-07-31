import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { parseBodyMiddleware } from "../../middlewares/parseBodyMiddleware";
import { fileUploader } from "../../helpers/fileUploader";
import { url } from "inspector";
import { registerCustomerSchema, registerStaffValidation } from "./user.validation";
const router = Router();

router.post(
  "/register/customer",
  validateRequest(registerCustomerSchema),
  UserController.registerAsCustomer
); // ✅
router.post(
  "/register/stuff",
  validateRequest(registerStaffValidation),
  UserController.registerAsStaff
); // ✅

// Create review
router.post('/review', auth(UserRole.CUSTOMER), UserController.createReview)

router.get("/get-all-users", auth(UserRole.ADMIN), UserController.getAllUser);
router.get("/dashboard-stats", auth(UserRole.CUSTOMER), UserController.dashboardStats);

router.get(
  "/get-user/:userId",
  auth(UserRole.ADMIN, UserRole.STAFF),
  UserController.getUserById
);
router.get("/my-profile", auth(), UserController.getMyProfile);

router.patch(
  "/update-profile",
  fileUploader.uploadProfileImage,
  parseBodyMiddleware,
  auth(),
  UserController.updateProfile
);

router.delete(
  "/delete-user/:userId",
  auth(UserRole.ADMIN,),
  UserController.deleteUser
);

router.post(
  "/block/:id",
  auth(UserRole.ADMIN), // only admins can block
  UserController.blockUser
);

router.post(
  "/unblock/:id",
  auth(UserRole.ADMIN), // only admins can unblock
  UserController.unblockUser
);


export const UserRoutes = router;
