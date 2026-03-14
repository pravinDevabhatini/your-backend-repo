const mongoose = require('mongoose');

// Tracks profit owed to each investor per car sale
const profitSchema = new mongoose.Schema({
  carId:       { type:Number, required:true },
  carName:     String,
  userId:      { type:Number, required:true },
  userName:    String,
  soldDate:    String,
  soldPrice:   Number,
  investedAmt: Number,
  shareRatio:  Number,
  profitAmt:   Number,   // distributable share
  commissionAmt: Number, // commission share
  deadline:    String,   // 24 working hours from soldDate (IST)
  // Credit
  status:   { type:String, enum:['pending','credited','partial'], default:'pending' },
  creditedAt:  String,
  creditedBy:  String,
  proofUrl:    String,
  proofName:   String,
  creditNote:  String,
}, { timestamps: true });

module.exports = mongoose.model('Profit', profitSchema);
