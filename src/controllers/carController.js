const { IST, calcProfit, carAgeDays, profitDeadline } = require('../utils/helpers');
const { MAX_INVESTORS } = require('../config/constants');

let CARS = [
  { id:1,  make:'Toyota',  model:'Fortuner', year:'2022', variant:'4x4 AT',    transmission:'Automatic', fuelType:'Diesel',  purchasePrice:3200000, serviceCharges:80000,  totalCost:3280000, commissionPct:2.5, status:'sold',      soldPrice:4800000, group:'F1',  investors:[{userId:7,amount:1100000,assignedAt:'10 Jan 2024 10:00 AM'},{userId:8,amount:1100000,assignedAt:'10 Jan 2024 10:00 AM'},{userId:9,amount:1080000,assignedAt:'10 Jan 2024 10:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'10 Jan 2024 09:00 AM', soldDate:'15 Apr 2024 10:30 AM', dealerName:'Kumar Motors', dealerContact:'9876501234', showDealerToPartners:false, buyerName:'Amit Shah', buyerContact:'9988776655', showBuyerToPartners:false, updatedAt:'15 Apr 2024 10:30 AM', createdBy:'Admin' },
  { id:2,  make:'Honda',   model:'City',     year:'2021', variant:'VX CVT',     transmission:'Automatic', fuelType:'Petrol',  purchasePrice:980000,  serviceCharges:45000,  totalCost:1025000, commissionPct:2.5, status:'sold',      soldPrice:1350000, group:'T1',  investors:[{userId:1,amount:260000,assignedAt:'05 Feb 2024 11:00 AM'},{userId:2,amount:255000,assignedAt:'05 Feb 2024 11:00 AM'},{userId:3,amount:255000,assignedAt:'05 Feb 2024 11:00 AM'},{userId:4,amount:255000,assignedAt:'05 Feb 2024 11:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'05 Feb 2024 10:00 AM', soldDate:'20 Mar 2024 02:15 PM', dealerName:'City Auto', dealerContact:'9876502222', showDealerToPartners:false, buyerName:'Ritu Verma', buyerContact:'9911223344', showBuyerToPartners:false, updatedAt:'20 Mar 2024 02:15 PM', createdBy:'Admin' },
  { id:3,  make:'Maruti',  model:'Ertiga',   year:'2023', variant:'ZXi Plus',   transmission:'Manual',    fuelType:'Hybrid',  purchasePrice:1150000, serviceCharges:35000,  totalCost:1185000, commissionPct:2.5, status:'available', soldPrice:null,    group:'T2',  investors:[{userId:5,amount:600000,assignedAt:'10 Mar 2024 09:00 AM'},{userId:6,amount:585000,assignedAt:'10 Mar 2024 09:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'10 Mar 2024 08:00 AM', soldDate:null, dealerName:'Maruti Hub', dealerContact:'9876503333', showDealerToPartners:true,  buyerName:'', buyerContact:'', showBuyerToPartners:false, updatedAt:'10 Mar 2024 08:00 AM', createdBy:'Admin' },
  { id:4,  make:'BMW',     model:'X5',       year:'2023', variant:'xDrive40i',  transmission:'Automatic', fuelType:'Petrol',  purchasePrice:8500000, serviceCharges:250000, totalCost:8750000, commissionPct:2.5, status:'available', soldPrice:null,    group:'CR1', investors:[{userId:10,amount:8750000,assignedAt:'02 May 2024 10:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'02 May 2024 09:00 AM', soldDate:null, dealerName:'Premium BMW', dealerContact:'9876504444', showDealerToPartners:true,  buyerName:'', buyerContact:'', showBuyerToPartners:false, updatedAt:'02 May 2024 09:00 AM', createdBy:'Admin' },
  { id:5,  make:'Hyundai', model:'Creta',    year:'2022', variant:'SX Opt CVT', transmission:'CVT',       fuelType:'Petrol',  purchasePrice:1400000, serviceCharges:60000,  totalCost:1460000, commissionPct:2.5, status:'sold',      soldPrice:1850000, group:'T1',  investors:[{userId:1,amount:295000,assignedAt:'15 Mar 2024 10:00 AM'},{userId:2,amount:290000,assignedAt:'15 Mar 2024 10:00 AM'},{userId:3,amount:290000,assignedAt:'15 Mar 2024 10:00 AM'},{userId:4,amount:290000,assignedAt:'15 Mar 2024 10:00 AM'},{userId:5,amount:295000,assignedAt:'15 Mar 2024 10:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'15 Mar 2024 09:00 AM', soldDate:'22 May 2024 11:00 AM', dealerName:'Hyundai Star', dealerContact:'9876505555', showDealerToPartners:false, buyerName:'Prashant Reddy', buyerContact:'9900112233', showBuyerToPartners:false, updatedAt:'22 May 2024 11:00 AM', createdBy:'Admin' },
  { id:6,  make:'Kia',     model:'Seltos',   year:'2023', variant:'HTX Plus',   transmission:'CVT',       fuelType:'Petrol',  purchasePrice:1600000, serviceCharges:55000,  totalCost:1655000, commissionPct:2.5, status:'available', soldPrice:null,    group:'T2',  investors:[{userId:5,amount:830000,assignedAt:'05 Jun 2024 10:00 AM'},{userId:6,amount:825000,assignedAt:'05 Jun 2024 10:00 AM'}], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[], uploadedAt:'05 Jun 2024 09:00 AM', soldDate:null, dealerName:'Kia World', dealerContact:'9876506666', showDealerToPartners:true,  buyerName:'', buyerContact:'', showBuyerToPartners:false, updatedAt:'05 Jun 2024 09:00 AM', createdBy:'Admin' },
];

const enrichCar = (car) => ({
  ...car,
  ageDays: carAgeDays(car.uploadedAt, car.soldDate),
  ageLabel: (() => {
    const d = carAgeDays(car.uploadedAt, car.soldDate);
    return car.status === 'sold' ? `Sold in ${d} days` : `${d} days in inventory`;
  })(),
  profitCalc: car.soldPrice ? calcProfit(car.soldPrice, car.totalCost, car.commissionPct) : null,
});

exports.getCars = (req, res) => {
  const { status, group } = req.query;
  let r = CARS.map(enrichCar);
  if (status && status !== 'all') r = r.filter(c => c.status === status);
  if (group) r = r.filter(c => c.group === group);
  // Hide profit formula from partners
  if (req.user.role === 'user') r = r.map(c => ({ ...c, profitCalc: null }));
  res.json({ success:true, count:r.length, cars:r, ts:IST() });
};

exports.getCarById = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  let c = enrichCar(car);
  if (req.user.role === 'user') c = { ...c, profitCalc:null };
  res.json({ success:true, car:c, ts:IST() });
};

exports.createCar = (req, res) => {
  const now = IST();
  const bp = Number(req.body.purchasePrice)||0, sc = Number(req.body.serviceCharges)||0;
  const car = {
    id: Date.now(), ...req.body,
    purchasePrice:bp, serviceCharges:sc, totalCost:bp+sc,
    commissionPct: Number(req.body.commissionPct)||2.5,
    status:'available', soldPrice:null, soldDate:null,
    investors:[], photos:[], purchaseBill:null, serviceBill:null, otherDocs:[],
    uploadedAt:now, updatedAt:now, createdBy:req.user.name,
  };
  CARS.push(car);
  res.status(201).json({ success:true, car:enrichCar(car), ts:now });
};

exports.updateCar = (req, res) => {
  const idx = CARS.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error:'Car not found' });
  const now = IST();
  const bp = Number(req.body.purchasePrice)||CARS[idx].purchasePrice;
  const sc = Number(req.body.serviceCharges)||CARS[idx].serviceCharges;
  CARS[idx] = { ...CARS[idx], ...req.body, purchasePrice:bp, serviceCharges:sc, totalCost:bp+sc, updatedAt:now, updatedBy:req.user.name };
  res.json({ success:true, car:enrichCar(CARS[idx]), ts:now });
};

exports.updateCommission = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  const pct = Number(req.body.commissionPct);
  if (isNaN(pct)||pct<0||pct>100) return res.status(400).json({ error:'Invalid commission percentage' });
  car.commissionPct = pct;
  car.updatedAt = IST();
  res.json({ success:true, commissionPct:pct, ts:car.updatedAt });
};

exports.markSold = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  if (car.status === 'sold') return res.status(400).json({ error:'Already sold' });
  const soldPrice = Number(req.body.soldPrice);
  if (!soldPrice) return res.status(400).json({ error:'soldPrice required' });
  const commPct = Number(req.body.commissionPct) || car.commissionPct || 2.5;
  const now = IST();
  const { margin, gross, dist } = calcProfit(soldPrice, car.totalCost, commPct);
  car.status = 'sold'; car.soldPrice = soldPrice; car.soldDate = now;
  car.commissionPct = commPct;
  car.platformMargin = margin; car.grossProfit = gross; car.distributableAmt = dist;
  car.buyerName = req.body.buyerName||''; car.buyerContact = req.body.buyerContact||'';
  car.showBuyerToPartners = !!req.body.showBuyerToPartners;
  car.updatedAt = now; car.updatedBy = req.user.name;

  // Auto-generate profit records for each investor
  const totInv = car.investors.reduce((s,i) => s+i.amount, 0);
  const profitRecords = car.investors.map(inv => {
    const ratio = totInv ? inv.amount / totInv : 0;
    return {
      carId: car.id, carName:`${car.make} ${car.model}`, userId: inv.userId,
      soldDate: now, soldPrice, investedAmt: inv.amount, shareRatio: ratio,
      profitAmt: Math.round(ratio * dist), commissionAmt: Math.round(ratio * margin),
      deadline: profitDeadline(now), status:'pending',
    };
  });

  res.json({ success:true, car:enrichCar(car), profit:{ gross, margin, dist }, profitRecords, ts:now });
};

exports.uploadPhotos = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  if (!req.files?.length) return res.status(400).json({ error:'No files' });
  const now = IST();
  const remaining = 5 - (car.photos||[]).length;
  const newPhotos = req.files.slice(0, remaining).map(f => ({ url:`/uploads/car-photos/${f.filename}`, filename:f.filename, uploadedAt:now, uploadedBy:req.user.name }));
  car.photos = [...(car.photos||[]), ...newPhotos];
  car.updatedAt = now;
  res.json({ success:true, photos:car.photos, ts:now });
};

exports.uploadBill = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  if (!req.file) return res.status(400).json({ error:'No file' });
  const now = IST();
  const billType = req.body.billType || 'purchase'; // purchase | service
  const doc = { url:`/uploads/bills/${req.file.filename}`, filename:req.file.filename, uploadedAt:now, uploadedBy:req.user.name };
  if (billType === 'service') car.serviceBill = doc;
  else car.purchaseBill = doc;
  car.updatedAt = now;
  res.json({ success:true, billType, doc, ts:now });
};

exports.toggleDealerVisibility = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  car.showDealerToPartners = !!req.body.show;
  car.updatedAt = IST();
  res.json({ success:true, showDealerToPartners:car.showDealerToPartners, ts:car.updatedAt });
};

exports.toggleBuyerVisibility = (req, res) => {
  const car = CARS.find(c => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ error:'Car not found' });
  car.showBuyerToPartners = !!req.body.show;
  car.updatedAt = IST();
  res.json({ success:true, showBuyerToPartners:car.showBuyerToPartners, ts:car.updatedAt });
};

exports.getCarsData = () => CARS;
exports.updateCarsData = (c) => { CARS = c; };
