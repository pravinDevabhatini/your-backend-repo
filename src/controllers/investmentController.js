const { IST, autoDistribute, canInvest, approvalExpiry } = require('../utils/helpers');
const { MAX_INVESTORS } = require('../config/constants');
const { getCarsData }  = require('./carController');
const { getDepositsData } = require('./depositController');

let REQUESTS = [];

// POST /api/investments/assign — admin assigns, auto-distributes equally, validates balance
exports.assignInvestment = (req, res) => {
  const { carId, investorIds } = req.body;
  if (!carId || !Array.isArray(investorIds)) return res.status(400).json({ error:'carId and investorIds required' });
  if (investorIds.length > MAX_INVESTORS)     return res.status(400).json({ error:`Max ${MAX_INVESTORS} investors per car` });
  const cars  = getCarsData();
  const deps  = getDepositsData();
  const car   = cars.find(c => c.id===Number(carId));
  if (!car) return res.status(404).json({ error:'Car not found' });
  if (car.status==='sold') return res.status(400).json({ error:'Car already sold' });

  const split = autoDistribute(car.totalCost, investorIds.map(Number));
  // Validate each investor's balance
  const errors = [];
  Object.entries(split).forEach(([uid, amt]) => {
    // Exclude this car's existing investment from current check
    const otherCars = cars.filter(c => c.id !== car.id);
    const chk = canInvest(Number(uid), amt, deps, otherCars);
    if (!chk.ok) errors.push(`User ${uid}: ${chk.error}`);
  });
  if (errors.length) return res.status(400).json({ error:'Balance insufficient', details:errors });

  const now = IST();
  car.investors = investorIds.map((uid, i) => ({
    userId: Number(uid), amount: split[Number(uid)],
    assignedAt: now, assignedBy: req.user.name,
  }));
  car.updatedAt = now;
  res.json({ success:true, carId, split, assignedAt:now, message:'Investment assigned successfully' });
};

// POST /api/investments/request — user self-invests, pending admin approval
exports.requestInvestment = (req, res) => {
  const { carId, amount } = req.body;
  const cars = getCarsData();
  const deps = getDepositsData();
  const car  = cars.find(c => c.id===Number(carId));
  if (!car) return res.status(404).json({ error:'Car not found' });
  if (car.status==='sold') return res.status(400).json({ error:'Car is sold' });
  if ((car.investors||[]).length >= MAX_INVESTORS) return res.status(400).json({ error:`Max ${MAX_INVESTORS} investors reached` });

  // Validate balance
  const chk = canInvest(req.user.userId, Number(amount), deps, cars.filter(c=>c.id!==car.id));
  if (!chk.ok) return res.status(400).json({ error:chk.error });

  const now = IST();
  const req2 = {
    id: Date.now(), carId:Number(carId), carName:`${car.make} ${car.model}`,
    userId: req.user.userId, userName: req.user.name,
    amount: Number(amount), status:'pending',
    requestedAt:now, expiresAt:approvalExpiry(),
  };
  REQUESTS.push(req2);
  res.status(201).json({ success:true, request:req2, message:'Request submitted. Admin will approve within 5 hours.' });
};

// GET /api/investments/requests
exports.getRequests = (req, res) => res.json({ success:true, requests:REQUESTS, ts:IST() });

// POST /api/investments/approve/:id
exports.approveRequest = (req, res) => {
  const r = REQUESTS.find(x => x.id===Number(req.params.id));
  if (!r) return res.status(404).json({ error:'Request not found' });
  if (r.status!=='pending') return res.status(400).json({ error:'Already processed' });
  const cars = getCarsData();
  const car  = cars.find(c => c.id===r.carId);
  if (!car) return res.status(404).json({ error:'Car not found' });
  if ((car.investors||[]).length >= MAX_INVESTORS) return res.status(400).json({ error:'Car already has max investors' });
  const now = IST();
  r.status='approved'; r.approvedAt=now; r.approvedBy=req.user.name;
  car.investors = [...(car.investors||[]), { userId:r.userId, amount:r.amount, assignedAt:now, assignedBy:req.user.name }];
  car.updatedAt = now;
  res.json({ success:true, request:r, ts:now });
};

// POST /api/investments/reject/:id
exports.rejectRequest = (req, res) => {
  const r = REQUESTS.find(x => x.id===Number(req.params.id));
  if (!r) return res.status(404).json({ error:'Request not found' });
  const now = IST();
  r.status='rejected'; r.rejectedAt=now; r.rejectedBy=req.user.name; r.rejectionNote=req.body.note||'';
  res.json({ success:true, request:r, ts:now });
};
