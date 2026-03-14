const { IST } = require('../utils/helpers');

let DEPOSITS = { 1:1500000, 2:1200000, 3:1300000, 4:1350000, 5:1200000, 6:1100000, 7:2200000, 8:2000000, 9:1800000, 10:9000000 };

let TRANSACTIONS = [
  { id:1, userId:1,  amount:1500000, type:'credit', note:'Initial deposit',  transactionDate:'01 Jan 2024 10:00 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:2, userId:7,  amount:2200000, type:'credit', note:'F-Series entry',   transactionDate:'05 Apr 2024 11:30 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:3, userId:10, amount:9000000, type:'credit', note:'CR-Series entry',  transactionDate:'01 Jun 2024 09:15 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:4, userId:2,  amount:1200000, type:'credit', note:'Initial deposit',  transactionDate:'05 Feb 2024 02:00 PM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:5, userId:3,  amount:1300000, type:'credit', note:'Initial deposit',  transactionDate:'10 Feb 2024 03:30 PM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:6, userId:4,  amount:1350000, type:'credit', note:'Initial deposit',  transactionDate:'15 Mar 2024 01:00 PM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:7, userId:5,  amount:1200000, type:'credit', note:'Initial deposit',  transactionDate:'20 Mar 2024 10:00 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:8, userId:6,  amount:1100000, type:'credit', note:'Initial deposit',  transactionDate:'01 Apr 2024 09:00 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:9, userId:8,  amount:2000000, type:'credit', note:'F-Series entry',   transactionDate:'10 May 2024 10:00 AM', createdBy:'Admin', proofUrl:null, proofName:null },
  { id:10,userId:9,  amount:1800000, type:'credit', note:'F-Series entry',   transactionDate:'15 May 2024 11:00 AM', createdBy:'Admin', proofUrl:null, proofName:null },
];

// GET /api/deposits
exports.getDeposits = (req, res) => {
  const { userId } = req.query;
  let txns = [...TRANSACTIONS];
  if (userId) txns = txns.filter(t => t.userId === Number(userId));
  if (req.user.role === 'user') txns = txns.filter(t => t.userId === req.user.userId);
  // Compute running balances per user
  const balances = {};
  TRANSACTIONS.forEach(t => {
    if (!balances[t.userId]) balances[t.userId] = 0;
    balances[t.userId] += t.type === 'credit' ? t.amount : -t.amount;
  });
  res.json({ success:true, transactions: txns.sort((a,b)=>b.id-a.id), balances, ts:IST() });
};

exports.getUserBalance = (req, res) => {
  const uid = Number(req.params.userId);
  if (req.user.role === 'user' && req.user.userId !== uid) return res.status(403).json({ error:'Access denied' });
  const txns = TRANSACTIONS.filter(t => t.userId === uid);
  const balance = txns.reduce((s,t) => s + (t.type==='credit' ? t.amount : -t.amount), 0);
  res.json({ success:true, userId:uid, balance, transactions: txns.sort((a,b)=>b.id-a.id), ts:IST() });
};

exports.getSummary = (req, res) => {
  const balances = {};
  TRANSACTIONS.forEach(t => {
    if (!balances[t.userId]) balances[t.userId] = 0;
    balances[t.userId] += t.type==='credit' ? t.amount : -t.amount;
  });
  const total = Object.values(balances).reduce((a,b)=>a+b, 0);
  res.json({ success:true, balances, totalDeposited:total, ts:IST() });
};

// POST /api/deposits/transaction  — admin only, with proof upload
exports.addTransaction = (req, res) => {
  const uid = Number(req.body.userId);
  const amt = Number(req.body.amount);
  if (!uid || !amt) return res.status(400).json({ error:'userId and amount required' });
  if (!['credit','debit'].includes(req.body.type)) return res.status(400).json({ error:'type must be credit or debit' });
  const now = IST();
  const txn = {
    id: Date.now(), userId:uid, amount:amt, type:req.body.type,
    note: req.body.note||'',
    transactionDate: now,
    createdBy: req.user.name,
    proofUrl:  req.file ? `/uploads/proofs/${req.file.filename}` : null,
    proofName: req.file ? req.file.originalname : null,
  };
  TRANSACTIONS.push(txn);
  if (!DEPOSITS[uid]) DEPOSITS[uid] = 0;
  DEPOSITS[uid] += txn.type==='credit' ? amt : -amt;
  const newBal = TRANSACTIONS.filter(t=>t.userId===uid).reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0);
  res.status(201).json({ success:true, transaction:txn, newBalance:newBal, ts:now });
};

exports.getDepositsData    = () => DEPOSITS;
exports.getTransactionsData = () => TRANSACTIONS;
