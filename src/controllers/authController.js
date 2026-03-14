const jwt  = require('jsonwebtoken');
const { IST } = require('../utils/helpers');

const DEMO = {
  superadmin: { pw:'super123',  role:'superadmin',  name:'Super Admin',   uid:null },
  admin:      { pw:'admin123',  role:'admin',        name:'Admin',         uid:null },
  accountant: { pw:'acct123',   role:'accountant',   name:'Accountant',    uid:null },
  rajesh:     { pw:'user123',   role:'user',         name:'Rajesh Kumar',  uid:1    },
  priya:      { pw:'user123',   role:'user',         name:'Priya Sharma',  uid:2    },
  venkat:     { pw:'user123',   role:'user',         name:'Venkat Reddy',  uid:3    },
  sunita:     { pw:'user123',   role:'user',         name:'Sunita Rao',    uid:4    },
  anil:       { pw:'user123',   role:'user',         name:'Anil Mehta',    uid:5    },
  deepika:    { pw:'user123',   role:'user',         name:'Deepika Nair',  uid:6    },
  suresh:     { pw:'user123',   role:'user',         name:'Suresh Pillai', uid:7    },
  kavita:     { pw:'user123',   role:'user',         name:'Kavita Singh',  uid:8    },
  ravi:       { pw:'user123',   role:'user',         name:'Ravi Shankar',  uid:9    },
  meena:      { pw:'user123',   role:'user',         name:'Meena Iyer',    uid:10   },
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  const acc = DEMO[username?.toLowerCase?.()];
  if (!acc || acc.pw !== password) return res.status(401).json({ error:'Invalid credentials' });
  const token = jwt.sign({ role:acc.role, name:acc.name, userId:acc.uid }, process.env.JWT_SECRET||'carcart_secret', { expiresIn:'7d' });
  res.json({ success:true, token, role:acc.role, name:acc.name, userId:acc.uid, loginAt:IST() });
};

exports.getMe = (req, res) => res.json({ success:true, user:req.user, ts:IST() });
