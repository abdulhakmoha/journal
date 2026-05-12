const express = require('express');
const path = require('path');
// Forced redeploy to apply registration fix
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS (allow all origins for Railway + Vercel/Netlify/localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: false
}));
app.options('*', cors()); // Handle preflight requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();

app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zentrader')
  .then(() => console.log('✅ Connected to MongoDB (ZenTrader)'))
  .catch((err) => console.error('❌ MongoDB Connection Error'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trades', require('./routes/tradeRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/backtest', require('./routes/backtestRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'ZenTrader API v2.0 - Running ✅' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
