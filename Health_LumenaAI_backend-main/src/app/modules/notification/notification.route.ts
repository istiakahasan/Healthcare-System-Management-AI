import { Router } from "express";
import { myNotifications } from "./notification.controller";


const router = Router();


router.get("/my-notifications", myNotifications);


export const NotificationRoutes = router;