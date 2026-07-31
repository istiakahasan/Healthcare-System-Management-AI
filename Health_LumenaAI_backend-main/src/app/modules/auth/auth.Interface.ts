import { UserRole } from "@prisma/client";

export interface SocialLoginPayload {
    email: string;
    fullName: string;
    socialLoginType: "GOOGLE";
    fcmToken: string;
    profileImage: string;
    role: UserRole;
    phoneNumber?: string;
}
export interface registerUser {
    email: string;
    password: string;
    role: UserRole;
    fcmToken?: string;
    hospitalChamber?: string;
    name?: string;

}