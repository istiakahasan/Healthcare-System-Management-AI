import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { DocumentControllers } from "./document.controller";
import { fileUploader } from "../../middlewares/multerFileUpload";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = Router();

router.post(
  "/upload-document",
  auth(UserRole.CUSTOMER),
  fileUploader.docFile,
  parseBodyData,
  DocumentControllers.uploadDocument,
);

router.get(
  "/patient-document/:id",
  auth(UserRole.CUSTOMER, UserRole.STAFF),
  DocumentControllers.patientAllDocument,
);

router.get("/wifi/reset", DocumentControllers.wifiReset);
router.get("/led/on", DocumentControllers.ledOn);
router.get("/value", DocumentControllers.valueData);

export const DocumentRoutes = router;
