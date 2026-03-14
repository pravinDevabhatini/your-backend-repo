const r = require('express').Router();
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
r.post('/login', login);
r.get('/me', protect, getMe);
module.exports = r;
