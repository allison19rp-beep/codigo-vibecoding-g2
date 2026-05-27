import prisma from '../../generated/prisma/index.js';

export default {
  getAll: async () => {
    return await prisma.task.findMany();
  },

  getById: async (id) => {
    return await prisma.task.findUnique({ where: { id } });
  },

  create: async (data) => {
    return await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || ''
      }
    });
  },

  update: async (id, data) => {
    return await prisma.task.update({
      where: { id },
      data
    });
  },

  delete: async (id) => {
    await prisma.task.delete({ where: { id } });
    return true;
  }
};