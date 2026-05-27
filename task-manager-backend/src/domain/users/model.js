import prisma from '../../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

export default {
  getAll: async () => {
    return await prisma.user.findMany();
  },

  getById: async (id) => {
    return await prisma.user.findUnique({ where: { id } });
  },

  getByEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  create: async (data) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return await prisma.user.create({
      data: {
        name: data.name,
        lastname: data.lastname,
        email: data.email,
        password: hashedPassword
      }
    });
  },

  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
};