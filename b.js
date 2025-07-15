const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const jwt = require('jsonwebtoken'); 
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '.env') });
const PORT = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET;

const app = express();

console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT || '(not set, using default 5000)');
console.log('- MONGO_URI:', process.env.MONGO_URI ? '(set)' : '(not set)');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '(set)' : '(not set)');
console.log('- TWILIO credentials:', (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) ? '(set)' : '(not set)');

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST'],
  credentials: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname)); 

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/makemytrip';
mongoose
  .connect(mongoURI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 
  })
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Attempted to connect using URI:', mongoURI.startsWith('mongodb') ? 
      `${mongoURI.substring(0, 15)}...` : 'Invalid URI');
  });

let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio client initialized successfully');
  } else {
    console.warn('Twilio credentials missing. OTP functionality will not work.');
  }
} catch (error) {
  console.error('Error initializing Twilio client:', error);
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const otpStore = {};

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    
    jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.status(403).json({ message: 'No authentication token provided' });
  }
};

app.post('/api/request-otp', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required.' });
  }

  const otp = generateOTP();
  otpStore[mobile] = otp; 
  
  console.log(`OTP for ${mobile}: ${otp}`);

  try {
    if (!twilioClient) {
      return res.status(200).json({ 
        message: 'Twilio not configured. For development, check server logs for OTP.',
        devOtp: otp 
      });
    }

    const message = await twilioClient.messages.create({
      body: `Your OTP for MakeMyTrip is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile
    });
    console.log('OTP sent, SID:', message.sid);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(200).json({ 
      message: 'Could not send real SMS. For development, use this OTP',
      devOtp: otp 
    });
  }
});

app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Server is running correctly' });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/new.html');
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobile:   { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.post('/api/signup', async (req, res) => {
  const { username, email, password, mobile, otp } = req.body;
  
  try {
    if (!otpStore[mobile] || otp !== otpStore[mobile]) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    delete otpStore[mobile];
    
    const newUser = new User({
      username,
      email,
      password,
      mobile
    });
    
    const savedUser = await newUser.save();
    console.log('User saved:', savedUser);
    
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ message: 'User created successfully', token, user: savedUser });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected when trying to login');
      return res.status(500).json({ message: 'Database connection issue, please try again later' });
    }
    
    const user = await User.findOne({ username });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const jwtSecretKey = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      jwtSecretKey,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/login-mobile', async (req, res) => {
  const { mobile, otp } = req.body;
  
  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (!otpStore[mobile] || otp !== otpStore[mobile]) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    delete otpStore[mobile];
    
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({ message: 'Login successful', token, user: { username: user.username, email: user.email } });
  } catch (error) {
    console.error('Error in mobile login:', error);
    res.status(500).json({ message: 'Error during mobile login', error: error.message });
  }
});

app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at: http://localhost:${PORT}/api/test`);
}).on('error', (err) => {
  console.error('Server failed to start:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port or close the application using this port.`);
  }
});
