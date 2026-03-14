const moment = require('moment-timezone');

const IST     = (d) => (d ? moment(d) : moment()).tz('Asia/Kolkata').format('DD MMM YYYY hh:mm:ss A');
const ISTDate = (d) => (d ? moment(d) : moment()).tz('Asia/Kolkata').format('DD MMM YYYY');

// Car age in days from uploadDate to soldDate (or today)
const carAgeDays = (uploadDate, soldDate) => {
  const start = moment(uploadDate);
  const end   = soldDate ? moment(soldDate) : moment();
  return end.diff(start, 'days');
};

// Calculate profit breakdown
const calcProfit = (soldPrice, totalCost, commissionPct = 2.5) => {
  if (!soldPrice) return { margin: 0, gross: 0, dist: 0, commissionPct };
  const margin = Math.round(soldPrice * (commissionPct / 100));
  const gross  = soldPrice - totalCost;
  return { margin, gross, dist: gross - margin, commissionPct };
};

// Auto-distribute car cost equally among investors
const autoDistribute = (totalCost, investorIds) => {
  if (!investorIds || !investorIds.length) return {};
  const per = Math.floor(totalCost / investorIds.length);
  const rem = totalCost - per * investorIds.length;
  const split = {};
  investorIds.forEach((uid, i) => { split[uid] = i === 0 ? per + rem : per; });
  return split;
};

// Get user's available balance = deposited - invested (only in non-sold cars)
const getUserBalance = (userId, deposits, cars) => {
  const dep = deposits[userId] || 0;
  let invested = 0;
  cars.forEach(car => {
    if (car.status !== 'sold') {
      const inv = (car.investors || []).find(i => i.userId === userId);
      if (inv) invested += inv.amount;
    }
  });
  return { dep, invested, available: dep - invested };
};

// Validate if user can invest amount in a car
const canInvest = (userId, amount, deposits, cars) => {
  const { available } = getUserBalance(userId, deposits, cars);
  if (amount > available) {
    return { ok: false, error: `Insufficient balance. Available: ₹${Number(available).toLocaleString('en-IN')}, Required: ₹${Number(amount).toLocaleString('en-IN')}` };
  }
  return { ok: true };
};

const approvalExpiry = () => moment().tz('Asia/Kolkata').add(5, 'hours').format('DD MMM YYYY hh:mm:ss A');
const profitDeadline = (soldDate) => moment(soldDate, 'DD MMM YYYY hh:mm:ss A').add(24, 'hours').format('DD MMM YYYY hh:mm:ss A');
const refundDeadline = (reqDate)  => moment(reqDate,  'DD MMM YYYY hh:mm:ss A').add(90, 'days').format('DD MMM YYYY');

module.exports = { IST, ISTDate, carAgeDays, calcProfit, autoDistribute, getUserBalance, canInvest, approvalExpiry, profitDeadline, refundDeadline };
