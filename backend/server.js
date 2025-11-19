
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables
const { Product, Customer, Sale, Otp } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
// Use the environment variable MONGO_URI if available, otherwise fallback to localhost
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriferti';

// Middleware
// CORS: Allow all origins for simplicity in this demo. For production, you might want to restrict this.
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Database Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('DB Connection Error:', err);
    // Keep the process alive but log the error, or exit process.exit(1)
  });

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

// Routes

// 1. Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.findOneAndUpdate(
      { phoneNumber },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`OTP for ${phoneNumber}: ${otp}`); // For demo purposes
    res.json({ success: true, message: 'OTP sent', otp }); // Returning OTP for demo convenience
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const record = await Otp.findOne({ phoneNumber });
    
    if (record && record.otp === otp) {
      const token = jwt.sign({ sub: phoneNumber, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      await Otp.deleteOne({ phoneNumber }); // Burn OTP
      return res.json({ success: true, token });
    }
    res.status(400).json({ success: false, message: 'Invalid OTP' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    // Map _id to id for frontend compatibility
    res.json(products.map(p => ({ ...p.toObject(), id: p._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ ...product.toObject(), id: product._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id', authenticate, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...updated.toObject(), id: updated._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Customer Routes
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers.map(c => ({ ...c.toObject(), id: c._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/customers', authenticate, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ ...customer.toObject(), id: customer._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Sales Routes (Transaction)
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales.map(s => ({ ...s.toObject(), id: s._id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/sales', authenticate, async (req, res) => {
  const { productId, quantity, customerName, customerCity, customerAddress } = req.body;
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Product not found');
    if (product.stock < quantity) throw new Error('Insufficient Stock');

    // 1. Create Customer
    const customer = new Customer({
      name: customerName,
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

    // 3. Create Sale
    const sale = new Sale({
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
