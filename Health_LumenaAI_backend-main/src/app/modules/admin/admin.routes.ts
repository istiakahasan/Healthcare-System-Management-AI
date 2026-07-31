import { Router } from "express";
import { AdminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.get(
  "/admin-dashboard-stats",
  auth(UserRole.ADMIN),
  AdminController.getDashboardStats,
);
router.get(
  "/admin-dashboard-stats/users",
  auth(UserRole.ADMIN),
  AdminController.getAdminDashboardStatsOfUsers,
);

router.get(
  "/pending-users",
  auth(UserRole.ADMIN), // only admins can unblock
  AdminController.getPendingUser,
);
router.post(
  "/approve-staff/:id",
  auth(UserRole.ADMIN), // only admins can unblock
  AdminController.approveStaff,
);
router.post(
  "/reject-staff/:id",
  auth(UserRole.ADMIN),
  AdminController.rejectStaff,
);
router.get(
  "/recent-shifts",
  auth(UserRole.ADMIN), // only admins can unblock
  AdminController.recentShifts,
);
router.get("/all-shifts", auth(UserRole.ADMIN), AdminController.getAllShifts);
router.delete(
  "/all-shifts/:id",
  auth(UserRole.ADMIN),
  AdminController.deleteShifts,
);

router.get(
  "/shift-overview",
  auth(UserRole.ADMIN),
  AdminController.shiftsOverview,
);

router.get(
  "/all-contact-support",
  auth(UserRole.ADMIN),
  AdminController.allContactSupport,
);

export const AdminRoutes = router;
