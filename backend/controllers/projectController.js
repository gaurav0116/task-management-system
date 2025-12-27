const mongoose = require('mongoose');
const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
    try {
        const { title, description, assignedUsers } = req.body;
        
        // Create project to database
        const project = await Project.create({
            title,
            description,
            assignedUsers
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get assigned projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        // Preare match conditions
        const matchStage = {};
        // If user is not admin, then only show assigned projects
        if (req.user.role !== 'admin') {
            matchStage.assignedUsers = new mongoose.Types.ObjectId(req.user._id);
        }

        // Get projects from database
        const projects = await Project.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedUsers',
                    foreignField: '_id',
                    as: 'assignedUsers'
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    assignedUsers: { _id: 1, name: 1, email: 1 }
                }
            }
        ]);

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProject,
    getProjects 
};
