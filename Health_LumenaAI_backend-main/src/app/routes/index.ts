import express from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { PatientRoutes } from "../modules/patient/patient.routes";
import { StaffRoutes } from "../modules/staff/staff.routes";
import { CarePlanRoutes } from "../modules/carePlan/carePlan.routes";
import { ShiftRoutes } from "../modules/shift/shift.routes";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { DocumentRoutes } from "../modules/document/document.route";
import { ShiftNoteRoute } from "../modules/shift-note/shiftNote.route";
import { ContactRoute } from "../modules/contact/contact.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/staff",
    route: StaffRoutes,
  },
  {
    path: "/patient",
    route: PatientRoutes,
  },
  {
    path: "/carePlan",
    route: CarePlanRoutes,
  },
  {
    path: "/shift",
    route: ShiftRoutes,
  },
  {
    path: "/notification",
    route: NotificationRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/document",
    route: DocumentRoutes,
  },
  {
    path: "/shift-note",
    route: ShiftNoteRoute,
  },
  {
    path: "/contact",
    route: ContactRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
