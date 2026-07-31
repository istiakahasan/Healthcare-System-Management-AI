import { ChatRoomParticipant, Prisma, UserRole } from "@prisma/client";
import status from "http-status";
import { IChatRoomWithReceiver } from "./chatRoom.interface";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";

// SOUROV CODE:
const createOrGetChatRoom = async (
  createdBy: string,
  participantId: string,
) => {
  // Sort participant IDs to make room unique for any order
  const ids = [createdBy, participantId].sort(); // sorts strings or numbers
  const roomId = `chat_${ids[0]}_${ids[1]}`;

  console.log(`Room ID: `, roomId);

  // Check if room exists
  let chatRoom: any = await prisma.chatRoom.findUnique({
    where: { roomId },
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
  });

  console.log(chatRoom);

  const creator = await prisma.user.findUnique({
    where: {
      id: createdBy,
    },
    select: {
      id: true,
      role: true,
    },
  });

  const participant = await prisma.user.findUnique({
    where: {
      id: participantId,
    },
  });

  if (!chatRoom) {
    console.log(`57 Line`);
    chatRoom = await prisma.chatRoom.create({
      data: {
        roomId,
        createdBy,
        ChatRoomParticipant: {
          create: [
            { userId: createdBy, role: creator?.role ?? UserRole.STAFF },
            {
              userId: participantId,
              role: participant?.role ?? UserRole.STAFF,
            },
          ],
        },
      },
      include: {
        ChatRoomParticipant: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                email: true,
                profileImage: true,
                role: true,
              },
            },
          },
        },
      },
    });
    console.log(`88 Line`);
  } else {
    await prisma.chatRoom.update({
      where: { id: chatRoom.id },
      data: { lastActivity: new Date() },
    });
  }
  return chatRoom;
};

// Create Or Get Chat Room
// const createOrGetChatRoom = async (
//   createdBy: string,
//   participantId: string,
// ): Promise<ChatRoomWithParticipants> => {
//   try {
//     // Validate inputs
//     if (!createdBy || !participantId) {
//       throw new Error("Both user IDs are required");
//     }

//     if (createdBy === participantId) {
//       throw new Error("Cannot create chat room with yourself");
//     }

//     // Sort participant IDs to make room unique for any order
//     const ids = [createdBy, participantId].sort();
//     const roomId = `chat_${ids[0]}_${ids[1]}`;

//     // Check if room exists
//     let chatRoom = await prisma.chatRoom.findUnique({
//       where: { roomId },
//       include: {
//         ChatRoomParticipant: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 firstName: true,
//                 lastName: true,
//                 email: true,
//                 profileImage: true,
//                 role: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!chatRoom) {
//       // Fetch both users in parallel to minimize database calls
//       const [creator, participant] = await Promise.all([
//         prisma.user.findUnique({
//           where: { id: createdBy },
//           select: { id: true, role: true },
//         }),
//         prisma.user.findUnique({
//           where: { id: participantId },
//           select: { id: true, role: true },
//         }),
//       ]);

//       // Validate users exist
//       if (!creator) {
//         throw new Error(`Creator with ID ${createdBy} not found`);
//       }
//       if (!participant) {
//         throw new Error(`Participant with ID ${participantId} not found`);
//       }

//       // Create new chat room
//       chatRoom = await prisma.chatRoom.create({
//         data: {
//           roomId,
//           createdBy,
//           ChatRoomParticipant: {
//             create: [
//               { userId: createdBy, role: creator.role ?? UserRole.STAFF },
//               {
//                 userId: participantId,
//                 role: participant.role ?? UserRole.STAFF,
//               },
//             ],
//           },
//         },
//         include: {
//           ChatRoomParticipant: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                   email: true,
//                   profileImage: true,
//                   role: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     } else {
//       // Update last activity for existing room
//       chatRoom = await prisma.chatRoom.update({
//         where: { id: chatRoom.id },
//         data: { lastActivity: new Date() },
//         include: {
//           ChatRoomParticipant: {
//             include: {
//               user: {
//                 select: {
//                   id: true,
//                   firstName: true,
//                   lastName: true,
//                   email: true,
//                   profileImage: true,
//                   role: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     }

//     return chatRoom;
//   } catch (error) {
//     console.error("Error in createOrGetChatRoom:", error);
//     throw error;
//   }
// };

// // Type definition (add to your types)
// type ChatRoomWithParticipants = Prisma.ChatRoomGetPayload<{
//   include: {
//     ChatRoomParticipant: {
//       include: {
//         user: {
//           select: {
//             id: true;
//             firstName: true;
//             lastName: true;
//             email: true;
//             profileImage: true;
//             role: true;
//           };
//         };
//       };
//     };
//   };
// }>;

const joinChatRoom = async (
  roomId: string,
  userId: string,
): Promise<ChatRoomParticipant> => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw new ApiError(status.NOT_FOUND, "Chat room not found");
  }
  const existingParticipant = await prisma.chatRoomParticipant.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (existingParticipant) {
    if (!existingParticipant.isActive) {
      await prisma.chatRoomParticipant.update({
        where: {
          id: existingParticipant.id,
        },
        data: {
          isActive: true,
          joinedAt: new Date(),
        },
      });
    }
    return existingParticipant;
  }

  return await prisma.chatRoomParticipant.create({
    data: {
      roomId,
      userId,
      role: UserRole.STAFF,
    },
  });
};

// get specific user message
const getSpecificChatRoomMessages = async (roomId: string, userId: string) => {
  const participant = await prisma.chatRoomParticipant.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });
  if (!participant || !participant.isActive) {
    throw new ApiError(
      status.FORBIDDEN,
      "You are not a participant in this room!!",
    );
  }

  const messages = await prisma.chat.findMany({
    where: {
      roomId,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          email: true,
          profileImage: true,
          role: true,
        },
      },
      replyTo: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return messages.reverse();
};
// get admin inbox
const getUserInbox = async (
  userId: string,
): Promise<IChatRoomWithReceiver[]> => {
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      ChatRoomParticipant: {
        some: {
          userId,
          isActive: true,
        },
      },
      isActive: true,
    },
    include: {
      ChatRoomParticipant: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              email: true,
              profileImage: true,
              role: true,
            },
          },
        },
      },
      Chat: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
            },
          },
        },
      },
      _count: {
        select: {
          Chat: {
            where: {
              sender: {
                id: { not: userId },
              },
              isRead: false,
            },
          },
        },
      },
    },
    orderBy: { lastActivity: "desc" },
  });

  // Add receiver information to each chat room
  const chatRoomsWithReceiver = chatRooms.map((room) => {
    // Find the other participant (receiver) in this chat room
    const receiver = room.ChatRoomParticipant.find(
      (participant) => participant.user.id !== userId,
    );
    return {
      ...room,
      receiverId: receiver?.user.id || null,
      receiverName: receiver?.user.firstName || null,
      receiverEmail: receiver?.user.email || null,
      receiverProfilePic: receiver?.user.profileImage || null,
      receiverRole: receiver?.user.role || null,
    };
  });

  return chatRoomsWithReceiver as unknown as IChatRoomWithReceiver[];
};
// update last seen
const updateRoomParticipantLastSeen = async (
  roomId: string,
  userId: string,
) => {
  await prisma.chatRoomParticipant.updateMany({
    where: {
      roomId,
      userId,
      isActive: true,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });
};
export const ChatRoomService = {
  createOrGetChatRoom,
  joinChatRoom,
  getSpecificChatRoomMessages,
  getUserInbox,
  updateRoomParticipantLastSeen,
};
