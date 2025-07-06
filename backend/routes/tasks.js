const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/user');

// Get all tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    })
    .populate('owner', 'name email')
    .populate('sharedWith.user', 'name email')
    .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    const { title, description, dueDate, priority, sharedWith } = req.body;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: req.user.id,
      status: 'pending'
    };

    // Add optional fields
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }
    
    if (priority) {
      taskData.priority = priority;
    }

    // Handle shared users
    if (sharedWith && sharedWith.length > 0) {
      const sharedUsers = [];
      
      for (const email of sharedWith) {
        if (email && email.trim()) {
          const user = await User.findOne({ email: email.trim() });
          if (user) {
            sharedUsers.push({
              user: user._id,
              permission: 'read'
            });
          }
        }
      }
      
      if (sharedUsers.length > 0) {
        taskData.sharedWith = sharedUsers;
      }
    }

    const task = new Task(taskData);
    await task.save();

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('taskCreated', populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    await task.save();

    // Populate the updated task
    const updatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('taskUpdated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Update entire task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, sharedWith } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update fields
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) task.priority = priority;

    // Handle shared users
    if (sharedWith !== undefined) {
      const sharedUsers = [];
      
      for (const email of sharedWith) {
        if (email && email.trim()) {
          const user = await User.findOne({ email: email.trim() });
          if (user) {
            sharedUsers.push({
              user: user._id,
              permission: 'read'
            });
          }
        }
      }
      
      task.sharedWith = sharedUsers;
    }

    await task.save();

    // Populate the updated task
    const updatedTask = await Task.findById(task._id)
      .populate('owner', 'name email')
      .populate('sharedWith.user', 'name email');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('taskUpdated', updatedTask);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user.id // Only owner can delete
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found or not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('taskDeleted', { taskId: req.params.id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;