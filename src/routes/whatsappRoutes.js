const r = require('express').Router();
const c = require('../controllers/whatsappController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
r.use(protect);
r.post('/send', restrictTo('admin'),              c.sendMessage);
r.get('/log',   restrictTo('admin','superadmin'), c.getLog);
module.exports = r;
