import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCustomer = async (data: any) => {
  try {
    await prisma.customer.create({
      data: {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
    });
  } catch (error: any) {
    return new Response(error.message, {
      status: 400,
    });
  }
};
