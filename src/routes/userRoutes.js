const r = require('express').Router();
const c = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
r.use(protect);
r.get('/',                          restrictTo('admin','superadmin','accountant'), c.getUsers);
r.get('/:id',                       c.getUserById);
r.post('/',                         restrictTo('admin'), c.createUser);
r.put('/:id',                       restrictTo('admin'), c.updateUser);
r.patch('/:id/status',              restrictTo('admin'), c.toggleStatus);
r.post('/:id/refund-request',       c.requestRefund);  // user can request their own refund
module.exports = r;
