const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { checkAuth, admin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validationMiddleware');
const { createProjectSchema } = require('../utils/validationSchemas');

router.route('/')
    .post(checkAuth, admin, validateRequest(createProjectSchema), createProject)
    .get(checkAuth, getProjects);

module.exports = router;
