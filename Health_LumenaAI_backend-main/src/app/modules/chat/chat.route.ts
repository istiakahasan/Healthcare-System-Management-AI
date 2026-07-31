import { Router } from "express";
import { ChatController } from "./chat.Controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
    "/create-chat",
    auth(),
    ChatController.createChat
);

router.get(
    "/get-my-chats",
    auth(),
    ChatController.getMyChats
);

router.get(
    "/participants",
    auth(),
    ChatController.getChatParticipantFromDB
);

router.get(
    "/all-users-chat",
    auth(UserRole.ADMIN, UserRole.ADMIN),
    ChatController.getAllUserChats
);

export const ChatRoutes = router;
