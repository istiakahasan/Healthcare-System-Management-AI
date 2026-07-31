import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { CarePlanController } from "./carePlan.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createCarePlanSchema, updateCarePlanSchema } from "./carePlan.validation";

const router = Router();

// Customer routes
router.post(
  '/create',
  auth(UserRole.CUSTOMER),
  validateRequest(createCarePlanSchema),
  CarePlanController.add
);

router.get(
  '/get-my',
  auth(UserRole.CUSTOMER),
  CarePlanController.getMy
);

// Admin routes
router.get(
  '/get-all',
  auth(UserRole.ADMIN),
  CarePlanController.getAll
);

router.get(
  '/details/:id',
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  CarePlanController.carePlanDetails
);

router.patch(
  '/update/:id',
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  validateRequest(updateCarePlanSchema),
  CarePlanController.update
);

router.delete(
  '/delete/:id',
  auth(UserRole.ADMIN, UserRole.CUSTOMER),
  CarePlanController.delete
);

export const CarePlanRoutes = router;