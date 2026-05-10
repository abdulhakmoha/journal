const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const router = express.Router();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb('Error: Images only!');
  }
});

// @route   POST api/upload
// @desc    Upload image
router.post('/', [auth, upload.single('image')], (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

module.exports = router;
