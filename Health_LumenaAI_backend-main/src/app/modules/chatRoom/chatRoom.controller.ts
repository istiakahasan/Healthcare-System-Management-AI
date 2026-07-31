import { Request, Response } from "express";

import { ChatRoomService } from "./chatRoom.service";
import catchAsync from "../../helpers/catchAsync";
import status from "http-status"
import sendResponse from "../../helpers/sendResponse";



// create chatRoom 
const createOrGetChatRoom = catchAsync(async (req: Request, res: Response) => {
    // console.log(req.body,"body")
    const userId = req.user?.id;
    const result = await ChatRoomService.createOrGetChatRoom(
        userId,
        req.body.participantId,
    );
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "Chat room created/retrieved successfully",
        data: result,
    });
});

const joinChatRoom = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { roomId } = req.params;
    const result = await ChatRoomService.joinChatRoom(roomId, userId);

    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Joined chat room successfully",
        data: result,
    });
});

const getUserInbox = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await ChatRoomService.getUserInbox(userId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "User inbox fetched successfully",
        data: result,
    });
});


const getSpecificChatRoomMessages = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await ChatRoomService.getSpecificChatRoomMessages(
        roomId,
        userId
    );
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Chat room messages retrieved successfully",
        data: result,
    });
});

const updateLastSeen = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { roomId } = req.params;
    await ChatRoomService.updateRoomParticipantLastSeen(roomId, userId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Last seen updated successfully",
        data: null,
    });
});
export const ChatRoomController = {
    createOrGetChatRoom,
    joinChatRoom,
    updateLastSeen,
    getSpecificChatRoomMessages,
    getUserInbox
}