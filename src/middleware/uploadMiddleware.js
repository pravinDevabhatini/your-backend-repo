const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const base = path.join(__dirname, '../../uploads');
['car-photos','documents','proofs','bills'].forEach(d => {
  const dp = path.join(base, d);
  if (!fs.existsSync(dp)) fs.mkdirSync(dp, { recursive: true });
});

const mk = (dir) => multer.diskStorage({
  destination: (req, f, cb) => cb(null, path.join(base, dir)),
  filename:    (req, f, cb) => cb(null, `${dir}_${Date.now()}${path.extname(f.originalname)}`),
});

const imgFilter = (req, f, cb) => /jpeg|jpg|png|gif|webp/.test(path.extname(f.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('Images only'));
const docFilter = (req, f, cb) => /jpeg|jpg|png|gif|webp|pdf/.test(path.extname(f.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('Image or PDF only'));

exports.uploadCarPhotos = multer({ storage: mk('car-photos'), fileFilter: imgFilter, limits:{ fileSize:10*1024*1024, files:5 } }).array('photos',5);
exports.uploadDoc       = multer({ storage: mk('documents'),  fileFilter: docFilter, limits:{ fileSize:20*1024*1024 } }).single('doc');
exports.uploadProof     = multer({ storage: mk('proofs'),     fileFilter: docFilter, limits:{ fileSize:10*1024*1024 } }).single('proof');
exports.uploadBill      = multer({ storage: mk('bills'),      fileFilter: docFilter, limits:{ fileSize:20*1024*1024 } }).single('bill');
exports.uploadMultiBill = multer({ storage: mk('bills'),      fileFilter: docFilter, limits:{ fileSize:20*1024*1024, files:4 } }).array('bills',4);
