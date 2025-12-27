const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, addComment } = require('../controllers/taskController');
const { checkAuth, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { createTaskSchema, updateTaskStatusSchema, addCommentSchema } = require('../utils/validationSchemas');

router.route('/')
    .post(checkAuth, admin, validateRequest(createTaskSchema), createTask)
    .get(checkAuth, getTasks);

router.put('/:id/status', checkAuth, validateRequest(updateTaskStatusSchema), updateTaskStatus);
router.post('/:id/comment', checkAuth, validateRequest(addCommentSchema), addComment);

module.exports = router;
