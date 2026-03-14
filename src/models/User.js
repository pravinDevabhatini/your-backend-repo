const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  refId:    { type:String, required:true, unique:true, trim:true },
  name:     { type:String, required:true, trim:true },
  email:    { type:String, required:true, unique:true, lowercase:true, trim:true },
  mobile:   { type:String, required:true },
  password: { type:String, required:true },
  role:     { type:String, enum:['superadmin','admin','accountant','user'], default:'user' },
  status:   { type:String, enum:['active','disabled'], default:'active' },
  group:    { type:String, trim:true },            // only for role=user
  // Bank
  bankName: String, accountNumber: String, ifsc: String, branch: String,
  // KYC
  pan: String, aadhar: String, address: String, panImage: String, aadharImage: String,
  // WA
  whatsappOptIn: { type:Boolean, default:false }, whatsappNumber: String,
  joinedDate: String,
  // Deposit refund requests
  refundRequests: [{
    requestedAt: String,
    amount: Number,
    status: { type:String, enum:['pending','approved','rejected'], default:'pending' },
    dueBy: String,
    processedAt: String,
    note: String,
  }],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function(p) { return bcrypt.compare(p, this.password); };
userSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };

module.exports = mongoose.model('User', userSchema);
