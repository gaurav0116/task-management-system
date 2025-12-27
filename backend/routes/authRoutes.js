const express = require('express');
const router = express.Router();
const { loginUser, getUsers } = require('../controllers/authController');
const validateRequest = require('../middleware/validationMiddleware');
const { loginSchema } = require('../utils/validationSchemas');

const { checkAuth, admin } = require('../middleware/authMiddleware');

router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/users', checkAuth, admin, getUsers);

module.exports = router;
