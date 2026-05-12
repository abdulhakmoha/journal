const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const User = require('./backend/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zentrader';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const email = 'admin@zentrader.com'; // Default email
    const password = 'admin123'; // Default password
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (user) {
      user.password = hashedPassword;
      user.isAdmin = true;
      await user.save();
      console.log(`✅ Admin updated! Email: ${email}, Password: ${password}`);
    } else {
      const newUser = new User({
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        isAdmin: true
      });
      await newUser.save();
      console.log(`✅ New Admin created! Email: ${email}, Password: ${password}`);
    }
    
    process.exit();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
