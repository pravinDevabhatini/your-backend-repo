const { IST, calcProfit, profitDeadline } = require('../utils/helpers');
const { getCarsData }   = require('./carController');
const { getUsersData }  = require('./userController');

// In-memory profit records (generated when car is marked sold)
let PROFIT_RECORDS = [];

// Build profit records from sold cars (called on startup or refresh)
const syncProfitRecords = () => {
  const cars  = getCarsData();
  const sold  = cars.filter(c => c.status === 'sold');
  sold.forEach(car => {
    const totInv = (car.investors||[]).reduce((s,i)=>s+i.amount,0);
    car.investors.forEach(inv => {
      const key = `${car.id}_${inv.userId}`;
      const exists = PROFIT_RECORDS.find(r => r.key === key);
      if (!exists) {
        const { margin, gross, dist } = calcProfit(car.soldPrice, car.totalCost, car.commissionPct);
        const ratio = totInv ? inv.amount/totInv : 0;
        PROFIT_RECORDS.push({
          id: `${car.id}_${inv.userId}`,
          key,
          carId: car.id,
          carName: `${car.make} ${car.model} (${car.year})`,
          userId: inv.userId,
          soldDate: car.soldDate,
          soldPrice: car.soldPrice,
          investedAmt: inv.amount,
          shareRatio: ratio,
          profitAmt: Math.round(ratio * dist),
          commissionAmt: Math.round(ratio * margin),
          deadline: profitDeadline(car.soldDate),
          status: 'pending',
          creditedAt: null,
          creditedBy: null,
          proofUrl:   null,
          proofName:  null,
          creditNote: null,
        });
      }
    });
  });
};

// GET /api/profits — all profit records (admin/accountant/superadmin)
exports.getAllProfits = (req, res) => {
  syncProfitRecords();
  const { userId, carId, status } = req.query;
  let r = [...PROFIT_RECORDS];
  if (userId) r = r.filter(p => p.userId === Number(userId));
  if (carId)  r = r.filter(p => p.carId  === Number(carId));
  if (status) r = r.filter(p => p.status === status);
  const totalPending  = r.filter(p=>p.status==='pending').reduce((s,p)=>s+p.profitAmt,0);
  const totalCredited = r.filter(p=>p.status==='credited').reduce((s,p)=>s+p.profitAmt,0);
  res.json({ success:true, records:r, totalPending, totalCredited, ts:IST() });
};

// GET /api/profits/user/:userId — user's own profits
exports.getUserProfits = (req, res) => {
  syncProfitRecords();
  const uid = Number(req.params.userId);
  if (req.user.role==='user' && req.user.userId!==uid) return res.status(403).json({ error:'Access denied' });
  const r = PROFIT_RECORDS.filter(p => p.userId===uid);
  res.json({ success:true, records:r, ts:IST() });
};

// POST /api/profits/:id/credit — accountant credits profit to user (with proof)
exports.creditProfit = (req, res) => {
  const rec = PROFIT_RECORDS.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ error:'Profit record not found' });
  if (rec.status==='credited') return res.status(400).json({ error:'Already credited' });
  const now = IST();
  rec.status     = 'credited';
  rec.creditedAt = now;
  rec.creditedBy = req.user.name;
  rec.proofUrl   = req.file ? `/uploads/proofs/${req.file.filename}` : null;
  rec.proofName  = req.file ? req.file.originalname : null;
  rec.creditNote = req.body.note || '';
  res.json({ success:true, record:rec, message:'Profit credited successfully', ts:now });
};

// POST /api/profits/sync — re-sync profit records from sold cars
exports.syncProfits = (req, res) => {
  syncProfitRecords();
  res.json({ success:true, count:PROFIT_RECORDS.length, ts:IST() });
};

exports.getProfitRecords = () => { syncProfitRecords(); return PROFIT_RECORDS; };
