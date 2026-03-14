const { IST, refundDeadline } = require('../utils/helpers');

let USERS = [
  { id:1,  refId:'CC001', name:'Rajesh Kumar',  email:'rajesh@cc.in',   mobile:'98765 43210', bankName:'SBI',   accountNumber:'1234567890', ifsc:'SBIN0001234', branch:'Hyd Main',    pan:'ABCDE1234F', aadhar:'1234-5678-9012', address:'Flat 101, Green Towers, Hyderabad', whatsappOptIn:true,  whatsappNumber:'919876543210', status:'active', group:'T1',  role:'user', joinedDate:'01 Jan 2024', refundRequests:[] },
  { id:2,  refId:'CC002', name:'Priya Sharma',  email:'priya@cc.in',    mobile:'98765 43211', bankName:'HDFC',  accountNumber:'9876543210', ifsc:'HDFC0001234', branch:'Kukatpally',  pan:'FGHIJ5678K', aadhar:'2345-6789-0123', address:'Plot 22, SR Nagar, Hyd',             whatsappOptIn:true,  whatsappNumber:'919876543211', status:'active', group:'T1',  role:'user', joinedDate:'05 Feb 2024', refundRequests:[] },
  { id:3,  refId:'CC003', name:'Venkat Reddy',  email:'venkat@cc.in',   mobile:'98765 43212', bankName:'ICICI', accountNumber:'1122334455', ifsc:'ICIC0001234', branch:'Ameerpet',    pan:'LMNOP9012Q', aadhar:'3456-7890-1234', address:'H.No 5-6, Ameerpet',                 whatsappOptIn:false, whatsappNumber:'',             status:'active', group:'T1',  role:'user', joinedDate:'10 Feb 2024', refundRequests:[] },
  { id:4,  refId:'CC004', name:'Sunita Rao',    email:'sunita@cc.in',   mobile:'98765 43213', bankName:'Axis',  accountNumber:'5566778899', ifsc:'UTIB0001234', branch:'Madhapur',    pan:'RSTUV3456W', aadhar:'4567-8901-2345', address:'402, Cyber Heights, Madhapur',        whatsappOptIn:true,  whatsappNumber:'919876543213', status:'active', group:'T1',  role:'user', joinedDate:'15 Mar 2024', refundRequests:[] },
  { id:5,  refId:'CC005', name:'Anil Mehta',    email:'anil@cc.in',     mobile:'98765 43214', bankName:'Kotak', accountNumber:'6677889900', ifsc:'KKBK0001234', branch:'Gachibowli',  pan:'XYZAB7890C', aadhar:'5678-9012-3456', address:'Villa 8, Gachibowli',                 whatsappOptIn:true,  whatsappNumber:'919876543214', status:'active', group:'T2',  role:'user', joinedDate:'20 Mar 2024', refundRequests:[] },
  { id:6,  refId:'CC006', name:'Deepika Nair',  email:'deepika@cc.in',  mobile:'98765 43215', bankName:'SBI',   accountNumber:'7788990011', ifsc:'SBIN0005678', branch:'Banjara Hills',pan:'BCDEF2345G', aadhar:'6789-0123-4567', address:'Plot 14, Banjara Hills',              whatsappOptIn:true,  whatsappNumber:'919876543215', status:'active', group:'T2',  role:'user', joinedDate:'01 Apr 2024', refundRequests:[] },
  { id:7,  refId:'CC007', name:'Suresh Pillai', email:'suresh@cc.in',   mobile:'98765 43216', bankName:'HDFC',  accountNumber:'8899001122', ifsc:'HDFC0005678', branch:'Jubilee Hills',pan:'CDEFG3456H', aadhar:'7890-1234-5678', address:'H.No 3-7, Jubilee Hills',             whatsappOptIn:false, whatsappNumber:'',             status:'active', group:'F1',  role:'user', joinedDate:'05 Apr 2024', refundRequests:[] },
  { id:8,  refId:'CC008', name:'Kavita Singh',  email:'kavita@cc.in',   mobile:'98765 43217', bankName:'ICICI', accountNumber:'9900112233', ifsc:'ICIC0005678', branch:'Kondapur',    pan:'DEFGH4567I', aadhar:'8901-2345-6789', address:'Apt 201, Kondapur',                   whatsappOptIn:true,  whatsappNumber:'919876543217', status:'active', group:'F1',  role:'user', joinedDate:'10 May 2024', refundRequests:[] },
  { id:9,  refId:'CC009', name:'Ravi Shankar',  email:'ravi@cc.in',     mobile:'98765 43218', bankName:'Axis',  accountNumber:'0011223344', ifsc:'UTIB0005678', branch:'Hitech City', pan:'EFGHI5678J', aadhar:'9012-3456-7890', address:'Tower B, Hitech City',                whatsappOptIn:true,  whatsappNumber:'919876543218', status:'disabled',group:'F1',  role:'user', joinedDate:'15 May 2024', refundRequests:[] },
  { id:10, refId:'CC010', name:'Meena Iyer',    email:'meena@cc.in',    mobile:'98765 43219', bankName:'Kotak', accountNumber:'1122334455', ifsc:'KKBK0005678', branch:'Financial Dist',pan:'FGHIJ6789K',aadhar:'0123-4567-8901', address:'Villa 2, Financial District',         whatsappOptIn:false, whatsappNumber:'',             status:'active', group:'CR1', role:'user', joinedDate:'01 Jun 2024', refundRequests:[] },
];

exports.getUsers    = (req, res) => {
  let r = [...USERS];
  if (req.query.group)  r = r.filter(u => u.group === req.query.group);
  if (req.query.status) r = r.filter(u => u.status === req.query.status);
  if (req.query.role)   r = r.filter(u => u.role === req.query.role);
  res.json({ success:true, count:r.length, users:r, ts:IST() });
};

exports.getUserById = (req, res) => {
  const u = USERS.find(u => u.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error:'User not found' });
  if (req.user.role === 'user' && req.user.userId !== u.id) return res.status(403).json({ error:'Access denied' });
  res.json({ success:true, user:u, ts:IST() });
};

exports.createUser = (req, res) => {
  const now = IST();
  const u = { id:Date.now(), refId:'CC'+String(USERS.length+1).padStart(3,'0'), ...req.body, createdAt:now, updatedAt:now, refundRequests:[] };
  USERS.push(u);
  res.status(201).json({ success:true, user:u, ts:now });
};

exports.updateUser = (req, res) => {
  const idx = USERS.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error:'User not found' });
  const now = IST();
  USERS[idx] = { ...USERS[idx], ...req.body, updatedAt:now };
  res.json({ success:true, user:USERS[idx], ts:now });
};

exports.toggleStatus = (req, res) => {
  const u = USERS.find(u => u.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error:'User not found' });
  u.status = u.status === 'active' ? 'disabled' : 'active';
  u.updatedAt = IST();
  res.json({ success:true, status:u.status, ts:u.updatedAt });
};

// Partner requests deposit refund
exports.requestRefund = (req, res) => {
  const u = USERS.find(u => u.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error:'User not found' });
  const now = IST();
  const req2 = { requestedAt:now, amount:Number(req.body.amount), status:'pending', dueBy:refundDeadline(now), note:req.body.note||'' };
  u.refundRequests = [...(u.refundRequests||[]), req2];
  res.json({ success:true, request:req2, message:`Refund request submitted. Processing within 3 months (by ${req2.dueBy})`, ts:now });
};

exports.getUsersData = () => USERS;
exports.updateUsersData = (u) => { USERS = u; };
