import { UserRole } from "@prisma/client";
import { hashPassword } from "../modules/user/user.utils";
import config from "../../config";
import prisma from "../lib/prisma";


export const seedAdmin = async () => {
  const email = config.super_admin_email!;
  const password = config.super_admin_password!;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return;
  }
  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      firstName: "Mr.",
      lastName: "Admin",
      email,
      gender: "FEMALE",
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log("✅ Admin seeded successfully.");
};
// ✅

