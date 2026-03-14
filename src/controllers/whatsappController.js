const { IST } = require('../utils/helpers');
const { getUsersData } = require('./userController');

let LOG = [];

const TEMPLATES = {
  deposit:       (name,amt,bal,date)  => `💰 *DEPOSIT UPDATE*\n\nDear ${name},\n\nDeposit of ₹${Number(amt).toLocaleString('en-IN')} processed.\nWallet Balance: ₹${Number(bal).toLocaleString('en-IN')}\nDate: ${date}\n\n_Car Cart Partners_`,
  profit:        (name,car,profit,date)=> `🎉 *PROFIT CREDITED*\n\nDear ${name},\n\n${car} sold! Your share: ₹${Number(profit).toLocaleString('en-IN')}\nDate: ${date}\n\n_Car Cart Partners_`,
  car_update:    ()=> `🚗 *CAR UPDATE*\n\nDear Partner,\n\nA new car has been added to your investment group.\n\nLogin to Car Cart Partners to view details.\n\n_Car Cart Partners_`,
  profit_update: ()=> `💰 *PROFIT DISTRIBUTION*\n\nDear Partner,\n\nA car in your group has been sold! Your profit share will be credited within 24 working hours.\n\n_Car Cart Partners_`,
  deposit_update:()=> `🏦 *DEPOSIT UPDATE*\n\nDear Partner,\n\nYour deposit has been processed.\n\n_Car Cart Partners_`,
  custom:        (msg)=> msg,
};

exports.sendMessage = async (req, res) => {
  const { target, group, userIds, template, customMessage } = req.body;
  const users = getUsersData();
  let recipients = [];
  if (target==='all')        recipients = users.filter(u=>u.whatsappOptIn&&u.status==='active');
  else if (target==='group') recipients = users.filter(u=>u.group===group&&u.whatsappOptIn&&u.status==='active');
  else                       recipients = users.filter(u=>(userIds||[]).includes(u.id)&&u.whatsappOptIn);
  if (!recipients.length) return res.status(400).json({ error:'No WhatsApp-enabled recipients' });
  const now = IST();
  const msg = template==='custom' ? customMessage : (TEMPLATES[template] ? TEMPLATES[template]() : customMessage);
  const entry = { id:Date.now(), to: target==='all'?`All Partners (${recipients.length})`:target==='group'?`Group ${group} (${recipients.length})`:recipients.map(u=>u.name).join(', '), message:(msg||'').slice(0,100)+'...', template, recipientCount:recipients.length, sentAt:now, sentBy:req.user.name, status:'sent (preview)' };
  LOG.unshift(entry);
  res.json({ success:true, entry, note:'Preview mode — configure WA_API_KEY in .env for real delivery', ts:now });
};

exports.getLog = (req, res) => res.json({ success:true, logs:LOG, ts:IST() });
