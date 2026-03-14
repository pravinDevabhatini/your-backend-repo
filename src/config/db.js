const mongoose = require('mongoose');
module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carcart_v2');
    console.log('MongoDB connected');
  } catch (e) {
    console.log('MongoDB not available — running in memory mode');
  }
};
