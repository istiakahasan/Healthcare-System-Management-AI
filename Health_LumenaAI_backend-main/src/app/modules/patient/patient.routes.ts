import { Router } from "express";
import { PatientController } from "./patient.controller"; // adjust path
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { createPatientSchema, updatePatientSchema } from "./patient.validation";

const router = Router();

// Create a new patient
router.post("/create", auth(UserRole.CUSTOMER), validateRequest(createPatientSchema), PatientController.add);

// Get single patient details
router.get("/details/:id", auth(), PatientController.patientDetails);

// Get all patients (with pagination / filters via query)
router.get("/get-all", auth(), PatientController.getAll);

// Get My all patients (with pagination / filters via query)
router.get("/get-my", auth(UserRole.CUSTOMER), PatientController.getMy);

// Update a patient
router.patch("/update/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN), validateRequest(updatePatientSchema), PatientController.update);

// Delete a patient
router.delete("/delete/:id", auth(UserRole.CUSTOMER, UserRole.ADMIN), PatientController.delete);

export const PatientRoutes = router;
