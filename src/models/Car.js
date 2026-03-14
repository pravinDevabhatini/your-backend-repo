const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  userId:     { type:Number, required:true },
  amount:     { type:Number, required:true },
  assignedAt: String,
  assignedBy: String,
});

const carSchema = new mongoose.Schema({
  make: String, model: String, year: String, variant: String,
  transmission: String, fuelType: String,
  purchasePrice:  { type:Number, default:0 },
  serviceCharges: { type:Number, default:0 },
  totalCost:      { type:Number, default:0 },
  // Commission % (editable per car by admin)
  commissionPct: { type:Number, default:2.5 },
  // Dealer
  dealerName: String, dealerContact: String,
  showDealerToPartners: { type:Boolean, default:false },
  // Group
  group: String,
  // Status
  status: { type:String, enum:['available','sold'], default:'available' },
  // Sale
  soldPrice: Number, soldDate: String,
  grossProfit: Number, platformMargin: Number, distributableAmt: Number,
  buyerName: String, buyerContact: String,
  showBuyerToPartners: { type:Boolean, default:false },
  // Investors (max 5)
  investors: [investorSchema],
  // Media
  photos:    [{ url:String, filename:String, uploadedAt:String, uploadedBy:String }],
  // Bills & docs
  purchaseBill: { url:String, filename:String, uploadedAt:String },
  serviceBill:  { url:String, filename:String, uploadedAt:String },
  otherDocs:    [{ url:String, filename:String, docType:String, uploadedAt:String }],
  // Tracking
  uploadedAt: String,   // IST when car was added to inventory
  updatedAt:  String,
  createdBy:  String,
  updatedBy:  String,
}, { timestamps: true });

carSchema.pre('save', function(next) {
  this.totalCost = (this.purchasePrice || 0) + (this.serviceCharges || 0);
  if (this.soldPrice) {
    const pct = this.commissionPct || 2.5;
    this.platformMargin   = Math.round(this.soldPrice * pct / 100);
    this.grossProfit      = this.soldPrice - this.totalCost;
    this.distributableAmt = this.grossProfit - this.platformMargin;
  }
  next();
});

module.exports = mongoose.model('Car', carSchema);
