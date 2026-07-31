import { Router } from "express";
import { ChatRoomController } from "./chatRoom.controller";
import auth from "../../middlewares/auth";




const router = Router();

// Create or get chat room
router.post(
  "/create-chat-room",
  auth(),
  // validateRequest(ChatRoomValidation.createChatRoomValidation),
  ChatRoomController.createOrGetChatRoom
);
// get admin inbox
router.get(
  "/get-user-inbox",
  auth(),
  ChatRoomController.getUserInbox
);

// get specific chat
router.get(
  "/get-specific-chat",
  auth(),
  ChatRoomController.getSpecificChatRoomMessages
);

// join chat room
router.post(
  "/:roomId/join",
  ChatRoomController.joinChatRoom
);

// Update last seen in room
router.patch(
  "/:roomId/last-seen",
  ChatRoomController.updateLastSeen
);

export const ChatRoomRoutes = router;
