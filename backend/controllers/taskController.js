const mongoose = require('mongoose');
const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { title, description, status, projectId, assignedUser } = req.body;

        // Create task to database
        const task = await Task.create({
            title,
            description,
            status,
            projectId,
            assignedUser
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get assigned tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // Prepare match conditions
        const matchStage = {};
        // If user is not admin, then only show assigned tasks
        if (req.user.role !== 'admin') {
            matchStage.assignedUser = new mongoose.Types.ObjectId(req.user._id);
        }

        // Get tasks from database
        const tasks = await Task.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'projectId',
                    foreignField: '_id',
                    as: 'projectId'
                }
            },
            {
                $unwind: '$projectId'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedUser',
                    foreignField: '_id',
                    as: 'assignedUser'
                }
            },
            {
                $unwind: {
                    path: '$assignedUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    comments: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    projectId: { _id: 1, title: 1 },
                    assignedUser: { _id: 1, name: 1, email: 1 }
                }
            }
        ]);

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private (User/Admin)
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is authorized to update this task
        if (req.user.role !== 'admin' && task.assignedUser.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comment
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
         if(req.user.role !== 'admin' && task.assignedUser.toString() !== req.user._id.toString()) {
             return res.status(401).json({ message: 'Not authorized to comment on this task' });
         }

        const comment = {
            text,
            user: req.user._id,
            createdAt: Date.now()
        };

        task.comments.push(comment);
        await task.save();

        res.json(task.comments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTaskStatus,
    addComment
};
