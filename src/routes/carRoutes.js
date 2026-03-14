const r  = require('express').Router();
const c  = require('../controllers/carController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadCarPhotos, uploadBill } = require('../middleware/uploadMiddleware');

const wrapUpload = (fn) => (req, res, next) => fn(req, res, (err) => { if (err) return res.status(400).json({ error: err.message }); next(); });

r.use(protect);
r.get('/',                               c.getCars);
r.get('/:id',                            c.getCarById);
r.post('/',                              restrictTo('admin'), c.createCar);
r.put('/:id',                            restrictTo('admin'), c.updateCar);
r.patch('/:id/commission',               restrictTo('admin'), c.updateCommission);
r.patch('/:id/sold',                     restrictTo('admin'), c.markSold);
r.post('/:id/photos',                    restrictTo('admin'), wrapUpload(uploadCarPhotos), c.uploadPhotos);
r.post('/:id/bill',                      restrictTo('admin'), wrapUpload(uploadBill),      c.uploadBill);
r.patch('/:id/dealer-visibility',        restrictTo('admin'), c.toggleDealerVisibility);
r.patch('/:id/buyer-visibility',         restrictTo('admin'), c.toggleBuyerVisibility);
module.exports = r;
