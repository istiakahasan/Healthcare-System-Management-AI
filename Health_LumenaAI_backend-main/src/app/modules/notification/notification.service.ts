import { Notification, Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import ApiError from "../../errors/ApiError";
import status from 'http-status'
// Create a new notification
export const sendNotification = async (data: Prisma.NotificationCreateInput) => {
    try {
        const notification = await prisma.notification.create({
            data
        });
        return notification;
    } catch (error) {
        console.error("Error in sending notification:", error);
        throw error;
    }
};

// Get notifications for a specific user
export const getMyNotifications = async (receiverId: string) => {
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
        throw new ApiError(status.NOT_FOUND, "Receiver Not found!")
    }
    const notifications = await prisma.notification.findMany({
        where: { receiverId },
        orderBy: { createdAt: "desc" },
    });
    return notifications;

};
