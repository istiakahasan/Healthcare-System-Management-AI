import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { StaffControllers } from "./staff.controllers";
import { fileUploader } from "../../helpers/fileUploader";
import validateRequest, { validateQuery } from "../../middlewares/validateRequest";
import { matchStaffSchema } from "./staff.validation";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = Router();

// Profile Details
router.get(
  "/profile-details",
  auth(UserRole.STAFF),
  StaffControllers.profileDetails
);

//find staff new:Sourob
router.get(
  "/match-staff",
  auth(),
  validateQuery(matchStaffSchema),
  StaffControllers.matchStaff
);

router.get(
  "/matched-staff-details/:id",
  auth(),
  // validateQuery(matchStaffSchema),
  StaffControllers.matchedStaffDetails
);

router.get("/profile", auth(UserRole.STAFF), StaffControllers.getMyProfile);
router.get("/review", auth(UserRole.STAFF), StaffControllers.allReview);
router.patch(
  "/profile",
  auth(UserRole.STAFF),
  StaffControllers.updateSpecialistProfile
);
router.patch(
  "/update-image",
  auth(UserRole.STAFF),
  fileUploader.uploadProfileImage,
  StaffControllers.updateOrAddedProfileImage
);
router.post(
  "/contact-support",
  auth(UserRole.STAFF),
  fileUploader.uploadContactSupportImage,
  // fileUploader.uploadProfileImage,
  parseBodyData,
  StaffControllers.createContactSupport
);

// Client List
router.get(
  "/client-list",
  auth(UserRole.STAFF),
  StaffControllers.getAllClientList
);
router.get(
  "/client-list/:id",
  auth(UserRole.STAFF),
  StaffControllers.singleClientDetails
);

// Top Rated Staff
router.get(
  "/top-staff",
  auth(UserRole.ADMIN),
  StaffControllers.getTopRatedStaff
);
router.get(
  "/upcoming-shifts",
  auth(UserRole.STAFF),
  StaffControllers.upcomingShifts
);
router.get(
  "/completed-shifts",
  auth(UserRole.STAFF),
  StaffControllers.completedShifts
);

// Recent Feedback
router.get(
  "/recent-feedback",
  auth(UserRole.STAFF),
  StaffControllers.getRecentFeedback
);

// Today Schedule
router.get(
  "/today-schedule",
  auth(UserRole.STAFF),
  StaffControllers.todaysSchedule
);

// Dashboard Overview
router.get(
  "/dashboard-overview",
  auth(UserRole.STAFF),
  StaffControllers.staffDashboardOverview
);

export const StaffRoutes = router;
