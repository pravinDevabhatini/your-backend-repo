const r = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getCarsData }  = require('../controllers/carController');
const { getUsersData } = require('../controllers/userController');
const { IST }          = require('../utils/helpers');
const { SERIES }       = require('../config/constants');
r.use(protect);
r.get('/', (req,res) => {
  const cars=getCarsData(), users=getUsersData();
  const groups=Object.entries(SERIES).flatMap(([,s])=>s.groups.map(g=>({ group:g, series:s.label, cap:s.cap, members:users.filter(u=>u.group===g).length, cars:cars.filter(c=>c.group===g).length, sold:cars.filter(c=>c.group===g&&c.status==='sold').length, available:cars.filter(c=>c.group===g&&c.status==='available').length })));
  res.json({ success:true, groups, ts:IST() });
});
r.get('/:id', (req,res) => {
  const g=req.params.id, cars=getCarsData(), users=getUsersData();
  const ser=Object.values(SERIES).find(s=>s.groups.includes(g));
  if(!ser) return res.status(404).json({ error:'Group not found' });
  res.json({ success:true, group:g, series:ser.label, cap:ser.cap, members:users.filter(u=>u.group===g), cars:cars.filter(c=>c.group===g), ts:IST() });
});
module.exports = r;
