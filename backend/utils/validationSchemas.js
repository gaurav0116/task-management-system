const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const createProjectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    assignedUsers: Joi.array().items(Joi.string().required()) // Array of User IDs
});

const createTaskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    projectId: Joi.string().required(),
    assignedUser: Joi.string().optional(),
    status: Joi.string().valid('todo', 'in-progress', 'completed').optional()
});

const updateTaskStatusSchema = Joi.object({
    status: Joi.string().valid('todo', 'in-progress', 'completed').required()
});

const addCommentSchema = Joi.object({
    text: Joi.string().required()
});

module.exports = {
    loginSchema,
    createProjectSchema,
    createTaskSchema,
    updateTaskStatusSchema,
    addCommentSchema
};
