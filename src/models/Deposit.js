const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId:         { type:Number, required:true },
  amount:         { type:Number, required:true },
  type:           { type:String, enum:['credit','debit'], required:true },
  note:           String,
  proofUrl:       String,
  proofName:      String,
  transactionDate: String,   // IST
  createdBy:      String,
  createdById:    Number,
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
