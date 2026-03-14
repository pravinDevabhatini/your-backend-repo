const ROLES = { SUPER_ADMIN:'superadmin', ADMIN:'admin', ACCOUNTANT:'accountant', USER:'user' };

// Permissions matrix
const PERMISSIONS = {
  superadmin:  { viewAll:true,  editCars:false, addCars:false,  markSold:false, manageDeposits:false, viewReports:true,  manageUsers:false, assignInv:false, sendWA:false, uploadDocs:false, editCommission:false, creditProfits:false, viewProfitFormula:true  },
  admin:       { viewAll:true,  editCars:true,  addCars:true,   markSold:true,  manageDeposits:true,  viewReports:true,  manageUsers:true,  assignInv:true,  sendWA:true,  uploadDocs:true,  editCommission:true,  creditProfits:false, viewProfitFormula:true  },
  accountant:  { viewAll:true,  editCars:false, addCars:false,  markSold:false, manageDeposits:true,  viewReports:true,  manageUsers:false, assignInv:false, sendWA:false, uploadDocs:true,  editCommission:false, creditProfits:true,  viewProfitFormula:true  },
  user:        { viewAll:false, editCars:false, addCars:false,  markSold:false, manageDeposits:false, viewReports:false, manageUsers:false, assignInv:false, sendWA:false, uploadDocs:false, editCommission:false, creditProfits:false, viewProfitFormula:false },
};

const SERIES = {
  T:  { label:'T-Series',  cap:'10 Lakhs', color:'#00e5a0', groups:['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10']  },
  F:  { label:'F-Series',  cap:'50 Lakhs', color:'#d4a853', groups:['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10']  },
  CR: { label:'CR-Series', cap:'1 Crore',  color:'#c084fc', groups:['CR1','CR2','CR3','CR4','CR5','CR6','CR7','CR8','CR9','CR10'] },
};

const MAX_INVESTORS       = 5;
const DEFAULT_COMMISSION  = 2.5; // percent
const DEPOSIT_RETURN_DAYS = 90;  // 3 months
const PROFIT_CREDIT_HOURS = 24;  // working hours

module.exports = { ROLES, PERMISSIONS, SERIES, MAX_INVESTORS, DEFAULT_COMMISSION, DEPOSIT_RETURN_DAYS, PROFIT_CREDIT_HOURS };
