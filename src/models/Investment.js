const mongoose = require('mongoose');
const investSchema = new mongoose.Schema({
  carId: Number, userId: Number, userName: String,
  amount: Number, status: { type:String, enum:['pending','approved','rejected'], default:'pending' },
  requestedAt: String, expiresAt: String, approvedAt: String, approvedBy: String,
  rejectedAt: String, rejectionNote: String,
  assignmentType: { type:String, enum:['admin_assigned','auto_distributed','self_invest'], default:'admin_assigned' },
}, { timestamps: true });
module.exports = mongoose.model('Investment', investSchema);
