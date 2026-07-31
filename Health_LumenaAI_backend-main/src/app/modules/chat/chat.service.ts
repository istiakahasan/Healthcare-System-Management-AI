
import { ICreateChatPayload } from "./chat.interface";
import { ChatRoomService } from "../chatRoom/chatRoom.service";
import prisma from "../../lib/prisma";
import status from 'http-status'
import ApiError from "../../errors/ApiError";



const createChatIntoDB = async (
  senderId: string,
  payload: ICreateChatPayload
) => {
  const { receiverId, message } = payload;

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new ApiError(status.NOT_FOUND, "Receiver not found");
  }

  // Create or get chat room
  const chatRoom = await ChatRoomService.createOrGetChatRoom(
    senderId,
    receiverId
  );

  // Create chat message in the room
  const chat = await prisma.chat.create({
    data: {
      roomId: chatRoom!.id,
      senderId,
      message,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
      room: {
        include: {
          ChatRoomParticipant: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImage: true,
                  role: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return chat;
};

const markChatAsReadInDB = async (chatId: string, userId: string) => {
  // Check if chat exists
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      room: {
        include: {
          ChatRoomParticipant: true,
        },
      },
    },
  });

  if (!chat) {
    throw new ApiError(status.NOT_FOUND, "Chat not found");
  }

  // Check if user is a participant in the room
  const isParticipant = chat.room.ChatRoomParticipant.some(
    (p: any) => p.userId === userId && p.isActive
  );

  if (!isParticipant) {
    throw new ApiError(
      status.FORBIDDEN,
      "You can only mark messages in rooms you participate in as read"
    );
  }
  // Don't allow marking own messages as read
  if (chat.senderId === userId) {
    throw new ApiError(
      status.BAD_REQUEST,
      "You cannot mark your own messages as read"
    );
  }

  // Mark as read
  const updatedChat = await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      isRead: true,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
    },
  });
  return updatedChat;
};

const getMyChatsFromDB = async (userId: string) => {
  const result = await ChatRoomService.getUserInbox(userId);
  return result;
};

const getChatParticipantFromDB = async (userId: string) => {
  // Get all chat rooms where the user is a participant
  const chatRooms = await ChatRoomService.getUserInbox(userId);

  // Extract unique participants from all rooms
  const participantIds = new Set<string>();

  chatRooms.forEach((room: any) => {
    room.ChatRoomParticipant.forEach((participant: any) => {
      if (participant.user.id !== userId) {
        participantIds.add(participant.user.id);
      }
    });
  });

  // get participant details
  const participants = await prisma.user.findMany({
    where: {
      id: { in: Array.from(participantIds) },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
    },
  });
  return participants;
};
// Function to get chat history for WebSocket - now uses rooms
const getChatHistoryFromDB = async (
  userId: string,
  roomId: string,
  page: number = 1,
  limit: number = 50
) => {
  // Use the ChatRoom service to get messages
  const messages = await ChatRoomService.getSpecificChatRoomMessages(
    userId,
    roomId
  );
  return messages;
};
const getAllUsersChatFromDB = async (query: Record<string, unknown>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const messageLimit = Number(query.messageLimit) || 50; // Limit messages per chat room
  const skip = (page - 1) * limit;

  // get all chatRooms with pagination

  const [chatRoom, total] = await Promise.all([
    prisma.chatRoom.findMany({
      where: { isActive: true },
      include: {
        ChatRoomParticipant: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        Chat: {
          take: messageLimit,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            Chat: true,
            ChatRoomParticipant: true,
          },
        },
      },
      orderBy: { lastActivity: "desc" },
      skip,
      take: limit,
    }),
    prisma.chatRoom.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  // Transform the data to include user information
  const chatList = chatRoom.map((room) => {
    const participants = room.ChatRoomParticipant.map((participant) => ({
      id: participant.user.id,
      fullName: participant.user.firstName,
      email: participant.user.email,
      profileImage: participant.user.profileImage,
      role: participant.user.role,
      participantRole: participant.user.role,
    }));

    const messages = room.Chat.reverse().map((message) => ({
      id: message.id,
      message: message.message,
      isRead: message.isRead,
      sender: {
        id: message.sender.id,
        fullName: message.sender.firstName,
        profileImage: message.sender.profileImage,
        role: message.sender.role,
      },
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    return {
      id: room.id,
      roomId: room.roomId,
      participants,
      participantCount: room._count.ChatRoomParticipant,
      messageCount: room._count.Chat,
      messages,
      lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
      lastActivity: room.lastActivity,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
  });

  const totalPage = Math.ceil(total / limit);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: chatList,
  };
};

export const ChatService = {
  getMyChatsFromDB,
  createChatIntoDB,
  markChatAsReadInDB,
  getChatHistoryFromDB,
  getAllUsersChatFromDB,
  getChatParticipantFromDB,
};
