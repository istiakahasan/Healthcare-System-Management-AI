import prisma from "../../lib/prisma";

// Create Contact
const createContact = async (data: any) => {
  return await prisma.contact.create({
    data,
  });
};

// Get All Contacts
const getAllContacts = async (paginationOptions: any) => {
  const { page, limit, sortBy, sortOrder } = paginationOptions;
  const skip = (page - 1) * limit;

  // const where: any = {};

  const result = await prisma.contact.findMany({
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.contact.count();

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

// Get Single Contact
const getContact = async (id: string) => {
  return await prisma.contact.findUnique({
    where: {
      id,
    },
  });
};

// Delete Contact
const deleteContact = async (id: string) => {
  return await prisma.contact.delete({
    where: {
      id,
    },
  });
};

export const ContactService = {
  createContact,
  getAllContacts,
  getContact,
  deleteContact,
};
