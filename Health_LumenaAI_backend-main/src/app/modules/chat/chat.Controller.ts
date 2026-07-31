import { Request, Response } from "express";

import { ChatService } from "./chat.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import status from 'http-status'

const createChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ChatService.createChatIntoDB(userId, req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Chat message sent successfully",
    data: result,
  });
});

const getMyChats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ChatService.getMyChatsFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Chats retrieved successfully",
    data: result,
  });
});

const getChatParticipantFromDB = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ChatService.getChatParticipantFromDB(userId);
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "All unique users retrieved successfully",
    data: result,
  });
});

const markChatAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chatId } = req.params;
  const result = await ChatService.markChatAsReadInDB(chatId, userId);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Chat marked as read successfully",
    data: result,
  });
});

const getAllUserChats = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatService.getAllUsersChatFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "All user chats retrieved successfully",
    data: result,
  });
});

export const ChatController = {
  createChat,
  markChatAsRead,
  getMyChats,
  getAllUserChats,
  getChatParticipantFromDB
}

