import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { ShiftNoteControllers } from "./shiftNote.controller";
import { parseBodyData } from "../../middlewares/parseBodyData";
import { fileUploader } from "../../middlewares/multerFileUpload";

const route = Router();

// Create New Shift Note
route.post(
  "/",
  auth(UserRole.STAFF),
  fileUploader.image,
  parseBodyData,
  ShiftNoteControllers.createNewShiftNote
);
route.get("/", auth(UserRole.ADMIN), ShiftNoteControllers.getAllShiftNotes);
route.get(
  "/customer",
  auth(UserRole.CUSTOMER),
  ShiftNoteControllers.customerAllShiftNotes
);
route.get(
  "/staff",
  auth(UserRole.STAFF),
  ShiftNoteControllers.staffAllShiftNotes
);
route.get("/:id", auth(), ShiftNoteControllers.getSingleShiftNote);
route.patch(
  "/:id",
  auth(UserRole.ADMIN),
  ShiftNoteControllers.changeShiftNoteStatus
);

export const ShiftNoteRoute = route;
