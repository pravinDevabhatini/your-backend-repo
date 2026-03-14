const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();
const app = express();

// DB
require('./config/db')();

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health
app.get('/api/health', (req, res) => {
  const { IST } = require('./utils/helpers');
  res.json({ status: 'OK', server: 'Car Cart Partners API v2', time: IST() });
});

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/cars',        require('./routes/carRoutes'));
app.use('/api/deposits',    require('./routes/depositRoutes'));
app.use('/api/profits',     require('./routes/profitRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/reports',     require('./routes/reportRoutes'));
app.use('/api/groups',      require('./routes/groupRoutes'));
app.use('/api/whatsapp',    require('./routes/whatsappRoutes'));
app.use('/api/settings',    require('./routes/settingsRoutes'));

// Error handlers
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Car Cart API v2 on http://localhost:${PORT}`));
module.exports = app;
