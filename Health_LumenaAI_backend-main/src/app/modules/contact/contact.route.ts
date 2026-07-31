import { Router } from "express";
import { ContactController } from "./contact.controller";
import validateRequest from "../../middlewares/validateRequest";
import { ContactValidation } from "./contact.validation";

const route = Router();

route.post(
  "/",
  validateRequest(ContactValidation.createContact),
  ContactController.createContact,
);
route.get("/", ContactController.getAllContacts);
route.get("/:id", ContactController.getContact);
route.delete("/:id", ContactController.deleteContact);

export const ContactRoute = route;
