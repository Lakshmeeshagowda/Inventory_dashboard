
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  unit: String,
  purchasePrice: Number,
  sellingPrice: Number,
  stock: Number
});

const CustomerSchema = new mongoose.Schema({
  name: String,
  city: String,
  address: String,
  purchaseDate: String,
  purchasedProduct: String,
  quantity: Number
});

const SaleSchema = new mongoose.Schema({
  productId: String,
  customerId: String,
  quantity: Number,
  date: String,
  totalRevenue: Number,
  totalProfit: Number
});

const OtpSchema = new mongoose.Schema({
  phoneNumber: String,
  otp: String,
  createdAt: { type: Date, expires: 300, default: Date.now } // OTP expires in 5 mins
});

module.exports = {
  Product: mongoose.model('Product', ProductSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Sale: mongoose.model('Sale', SaleSchema),
  Otp: mongoose.model('Otp', OtpSchema)
};
