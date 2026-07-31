import { Router } from "express";
import { ShiftController } from "./shift.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { declineShiftRequestSchema, shiftValidationSchema } from "./shift.validation";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/send-shift-request", auth(UserRole.CUSTOMER), validateRequest(shiftValidationSchema), ShiftController.sendShiftRequest);
router.get("/my-shift-requests", auth(UserRole.STAFF), ShiftController.myShiftRequest);
router.post("/accept-shift-request/:id", auth(UserRole.STAFF), ShiftController.acceptShiftRequest);
router.post("/decline-shift-request/:id", auth(UserRole.STAFF), validateRequest(declineShiftRequestSchema), ShiftController.rejectShiftRequest);
router.get("/shift-request-details/:id", auth(UserRole.STAFF), ShiftController.shiftRequestDetails);

router.get("/my-shifts", auth(UserRole.CUSTOMER), ShiftController.myShifts);
router.get("/details/:id", auth(), ShiftController.shiftDetails);

export const ShiftRoutes = router;