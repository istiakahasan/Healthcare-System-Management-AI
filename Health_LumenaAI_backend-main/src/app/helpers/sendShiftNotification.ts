// In a new file: utils/sendShiftNotification.ts
import { NotificationCategory, NotificationPriority } from "@prisma/client";
import prisma from "../lib/prisma";
import { sendNotification } from "../modules/notification/notification.service";
import { createEmailTemplate, sendMail } from "../utils/sendEmail";

interface ShiftNotificationParams {
    receiverId: string;
    staffName: string;
    type: "ACCEPTED" | "REJECTED" | "REQUESTED" | "REMINDER";
    patientName?: string;
}

export const sendShiftNotification = async ({
    receiverId,
    staffName,
    type,
    patientName
}: ShiftNotificationParams) => {
    try {
        // Get receiver details
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { email: true, firstName: true, lastName: true, },
        });

        console.log('🔍 Receiver found:', receiver);

        if (!receiver) {
            console.error("❌ Receiver not found");
            return;
        }

        const messages = {
            ACCEPTED: {
                title: "Congratulations! Your Shift Request is accepted!",
                description: `Your Shift Request is accepted by ${staffName}`,
                emailSubject: "Shift Request Accepted - Congratulations!",
                emailHeading: "Shift Request Accepted! 🎉",
                emailBody: `Great news! Your shift request has been accepted by <strong style="color: #ffffff;">${staffName}</strong>.`,
            },
            REJECTED: {
                title: "Shift Request Declined",
                description: `Your Shift Request was declined by ${staffName}`,
                emailSubject: "Shift Request Update",
                emailHeading: "Shift Request Update",
                emailBody: `Unfortunately, your shift request was declined by <strong style="color: #ffffff;">${staffName}</strong>.`,
            },
            REQUESTED: {
                title: "New Shift Request Received",
                description: `You have a new shift request from ${staffName}`,
                emailSubject: "New Shift Request",
                emailHeading: "New Shift Request 📋",
                emailBody: `You have received a new shift request from <strong style="color: #ffffff;">${staffName}</strong>.`,
            },
            REMINDER: {
                title: "Upcoming Shift Reminder",
                description: `You are scheduled for a shift with ${patientName}. Please arrive on time.`,
                emailSubject: "Reminder: Your Upcoming Shift",
                emailHeading: "Shift Reminder Notification ⏰",
                emailBody: `
        Hello ${staffName},

        This is a friendly reminder about your upcoming shift. You are scheduled for a shift with ${patientName}.
        Please log in to your dashboard to view the full details and confirm your availability.

        Stay punctual and thank you for your dedication!

        Best regards,
        Shift Management Team
    `
            }

        };

        const msg = messages[type];

        // Send in-app notification
        try {
            console.log('📱 Sending in-app notification...');
            await sendNotification({
                category: NotificationCategory.MESSAGE,
                receiverId,
                title: msg.title,
                description: msg.description,
                priority: NotificationPriority.MEDIUM,
            });
            console.log('✅ In-app notification sent successfully');
        } catch (notifError) {
            console.error('❌ Notification error:', notifError);
        }

        // Send email notification
        try {
            console.log('📧 Preparing to send email to:', receiver.email);

            const emailContent = `
                <h2 style="text-align: center; color: #ffffff;">${msg.emailHeading}</h2>
                <div style="padding: 0 1em;">
                    <p style="line-height: 28px; color: #fff;">
                        Dear <strong style="color: #ffffff;">${receiver.firstName} ${receiver.lastName}</strong>,
                    </p>
                    <p style="line-height: 28px; color: #fff;">
                        ${msg.emailBody}
                    </p>
                    <p style="line-height: 28px; color: #fff;">
                        Please check your dashboard for more details.
                    </p>
                </div>
            `;

            console.log('📧 Calling sendMail...');
            const emailResult = await sendMail({
                to: "rafioulhasan2@gmail.com",
                subject: msg.emailSubject,
                html: createEmailTemplate(emailContent),
            });

            console.log('✅ Email sent successfully:', emailResult);
        } catch (emailError) {
            console.error('❌ Email error:', emailError);
            // Log the full error details
            if (emailError instanceof Error) {
                console.error('❌ Error message:', emailError.message);
                console.error('❌ Error stack:', emailError.stack);
            }
        }
    } catch (error) {
        console.error('❌ General error in sendShiftNotification:', error);
    }
};