const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zentrader';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Make everyone admin for now (so you can definitely get in)
    // Or you can specify email: await User.findOneAndUpdate({ email: 'your@email.com' }, { isAdmin: true });
    const result = await User.updateMany({}, { isAdmin: true });
    
    console.log(`✅ Updated ${result.modifiedCount} users to Admin status.`);
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
