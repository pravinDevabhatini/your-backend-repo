const { IST } = require('../utils/helpers');

let SETTINGS = {
  defaultCommissionPct: 2.5,
  depositReturnDays:    90,
  profitCreditHours:    24,
  platformName:         'Car Cart Partners',
  updatedAt:            null,
  updatedBy:            null,
};

exports.getSettings = (req, res) => res.json({ success:true, settings:SETTINGS, ts:IST() });

exports.updateSettings = (req, res) => {
  const now = IST();
  const allowed = ['defaultCommissionPct','depositReturnDays','profitCreditHours','platformName'];
  allowed.forEach(k => { if (req.body[k] !== undefined) SETTINGS[k] = req.body[k]; });
  SETTINGS.updatedAt = now;
  SETTINGS.updatedBy = req.user.name;
  res.json({ success:true, settings:SETTINGS, ts:now });
};
