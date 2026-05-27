import TaskModel from './model.js';

export default {
  getAll: async (req, res) => {
    const tasks = await TaskModel.getAll();
    res.json(tasks);
  },

  getById: async (req, res) => {
    const task = await TaskModel.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  },

  create: async (req, res) => {
    const { title, description } = req.body;
    const newTask = await TaskModel.create({ title, description });
    res.status(201).json(newTask);
  },

  update: async (req, res) => {
    const { title, description, completed } = req.body;
    try {
      const updatedTask = await TaskModel.update(req.params.id, { title, description, completed });
      res.json(updatedTask);
    } catch (error) {
      return res.status(404).json({ error: 'Task not found' });
    }
  },

  delete: async (req, res) => {
    try {
      await TaskModel.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      return res.status(404).json({ error: 'Task not found' });
    }
  }
};