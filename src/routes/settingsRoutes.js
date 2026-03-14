const r = require('express').Router();
const c = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/',   restrictTo('admin','superadmin','accountant'), c.getSettings);
r.put('/',   restrictTo('admin'),                           c.updateSettings);
module.exports = r;
