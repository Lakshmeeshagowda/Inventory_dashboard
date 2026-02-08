
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, sparse: true, lowercase: true, index: true },
  phoneNumber: { type: String, sparse: true, index: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true }, // Links data to specific user
  name: String,
  category: String,
  unit: String,
  purchasePrice: Number,
  sellingPrice: Number,
  stock: Number
});

const CustomerSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true }, // Links data to specific user
  name: String,
  city: String,
  address: String,
  phoneNumber: String,
  purchaseDate: String,
  purchasedProduct: String,
  quantity: Number
});

const SaleSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true }, // Links data to specific user
  productId: String,
  customerId: String,
  quantity: Number,
  date: String,
  totalRevenue: Number,
  totalProfit: Number
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Product: mongoose.model('Product', ProductSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Sale: mongoose.model('Sale', SaleSchema)
};
