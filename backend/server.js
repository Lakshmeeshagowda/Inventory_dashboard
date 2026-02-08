
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config(); // Load environment variables
const { User, Product, Customer, Sale } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
// Use the environment variable MONGO_URI if available, otherwise fallback to localhost
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriferti';

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Database Connection
mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Fail faster if blocked
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('DB Connection Error:', err);
  });

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // req.user.sub contains the PhoneNumber
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.send("AgriFerti Backend is Running");
});

// 1. Auth Routes

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, phoneNumber, password, confirmPassword } = req.body;
    
    if (!password || password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    
    if (!email && !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists. Please login.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email ? email.toLowerCase() : null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword
    });

    await newUser.save();

    // Generate token
    const userId = newUser._id.toString();
    const token = jwt.sign({ sub: userId, email, phoneNumber }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      success: true, 
      message: 'Signup successful',
      token,
      userId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (!email && !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        email ? { email: email.toLowerCase() } : null,
        phoneNumber ? { phoneNumber } : null
      ].filter(Boolean)
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please sign up.' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Generate token
    const userId = user._id.toString();
    const token = jwt.sign({ sub: userId, email: user.email, phoneNumber: user.phoneNumber }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      userId 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user exists
app.post('/api/auth/check-user', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ exists: false });
    }

    const user = await User.findOne({
      $or: [
        email ? { email: email.toLowerCase() } : null,
        phoneNumber ? { phoneNumber } : null
      ].filter(Boolean)
    });

    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
});

// 2. Product Routes (Scoped by ownerId)
app.get('/api/products', authenticate, async (req, res) => {
  try {
    // Only fetch products owned by the logged-in user
    const products = await Product.find({ ownerId: req.user.sub });
    res.json(products.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  try {
    // Add ownerId when creating
    const product = new Product({ ...req.body, ownerId: req.user.sub });
    await product.save();
    res.json({ ...product.toObject(), id: product._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', authenticate, async (req, res) => {
  try {
    // Ensure user owns the product they are updating
    const updated = await Product.findOneAndUpdate(
        { _id: req.params.id, ownerId: req.user.sub },
        req.body,
        { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found or unauthorized' });
    res.json({ ...updated.toObject(), id: updated._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  try {
    // Ensure user owns the product they are deleting
    const result = await Product.findOneAndDelete({ _id: req.params.id, ownerId: req.user.sub });
    if (!result) return res.status(404).json({ message: 'Product not found or unauthorized' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Customer Routes (Scoped by ownerId)
app.get('/api/customers', authenticate, async (req, res) => {
  try {
    const customers = await Customer.find({ ownerId: req.user.sub });
    res.json(customers.map(c => ({ ...c.toObject(), id: c._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', authenticate, async (req, res) => {
  try {
    const customer = new Customer({ ...req.body, ownerId: req.user.sub });
    await customer.save();
    res.json({ ...customer.toObject(), id: customer._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Sales Routes (Scoped by ownerId & Transaction)
app.get('/api/sales', authenticate, async (req, res) => {
  try {
    const sales = await Sale.find({ ownerId: req.user.sub });
    res.json(sales.map(s => ({ ...s.toObject(), id: s._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sales', authenticate, async (req, res) => {
  const { productId, quantity, customerName, customerPhone, customerCity, customerAddress } = req.body;
  const ownerId = req.user.sub;

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Verify Product belongs to user
    const product = await Product.findOne({ _id: productId, ownerId }).session(session);
    
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient Stock');

    // 1. Create Customer (Scoped)
    const customer = new Customer({
      ownerId,
      name: customerName,
      phoneNumber: customerPhone,
      city: customerCity,
      address: customerAddress,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasedProduct: product.name,
      quantity
    });
    await customer.save({ session });

    // 2. Update Stock
    product.stock -= quantity;
    await product.save({ session });

    // 3. Create Sale (Scoped)
    const sale = new Sale({
      ownerId,
      productId,
      customerId: customer._id,
      quantity,
      date: new Date().toISOString().split('T')[0],
      totalRevenue: product.sellingPrice * quantity,
      totalProfit: (product.sellingPrice - product.purchasePrice) * quantity
    });
    await sale.save({ session });

    await session.commitTransaction();
    res.json({ success: true });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
