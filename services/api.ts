
import type { Product, Customer, Sale } from '../types';

// --- CONFIGURATION ---
// Toggle this to TRUE to use the real Node.js + MongoDB backend
// Toggle this to FALSE to use the browser LocalStorage (Demo Mode)
const USE_REAL_BACKEND = true;
const API_BASE_URL = 'http://localhost:5000/api';

// --- MOCK DATABASE (LocalStorage) ---
const DB_KEYS = {
  PRODUCTS: 'agri_products',
  CUSTOMERS: 'agri_customers',
  SALES: 'agri_sales',
  TOKEN: 'agri_auth_token'
};

const db = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const seedData = {
  products: [
    { id: 'p1', name: 'Urea', category: 'Nitrogenous Fertilizers', unit: 'bag', purchasePrice: 1100, sellingPrice: 1150, stock: 15 },
    { id: 'p2', name: 'Potassium', category: 'Potassic Fertilizers', unit: 'bag', purchasePrice: 800, sellingPrice: 850, stock: 10 },
  ] as Product[],
  customers: [
    { id: 'c1', name: 'Taha', city: 'Bengaluru', address: 'Ashwathnagar Nagavara', purchaseDate: '2025-11-04', purchasedProduct: 'Urea', quantity: 5 },
    { id: 'c2', name: 'Lakshmeesha', city: 'Belthangady', address: 'Bangady house, Indabettu', purchaseDate: '2025-11-04', purchasedProduct: 'Potassium', quantity: 10 },
  ] as Customer[],
  sales: [
    { id: 's1', productId: 'p1', customerId: 'c1', quantity: 5, date: '2025-11-04', totalRevenue: 5750, totalProfit: 250 },
    { id: 's2', productId: 'p2', customerId: 'c2', quantity: 10, date: '2025-11-04', totalRevenue: 8500, totalProfit: 500 },
  ] as Sale[]
};

const otpStore: Record<string, string> = {};

// --- REAL API IMPLEMENTATION (Fetch) ---
const realApi = {
  auth: {
    sendOtp: async (phoneNumber: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      return res.json();
    },
    verifyOtp: async (phoneNumber: string, otp: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp })
      });
      const data = await res.json();
      if (data.token) localStorage.setItem(DB_KEYS.TOKEN, data.token);
      return data;
    },
    logout: async () => {
      localStorage.removeItem(DB_KEYS.TOKEN);
    },
    isAuthenticated: () => !!localStorage.getItem(DB_KEYS.TOKEN)
  },
  products: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/products`);
      return res.json();
    },
    add: async (product: Omit<Product, 'id'>) => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(product)
      });
      return res.json();
    },
    update: async (product: Product) => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(product)
      });
      return res.json();
    },
    delete: async (id: string) => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  },
  customers: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/customers`);
      return res.json();
    },
    add: async (customer: Omit<Customer, 'id'>) => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(customer)
      });
      return res.json();
    }
  },
  sales: {
    list: async () => {
      const res = await fetch(`${API_BASE_URL}/sales`);
      return res.json();
    },
    create: async (data: any) => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Transaction failed');
      }
    }
  }
};

// --- MOCK API IMPLEMENTATION (LocalStorage) ---
const mockApi = {
  auth: {
    sendOtp: async (phoneNumber: string): Promise<{ success: boolean; message: string; otp?: string }> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.length < 10) return { success: false, message: 'Invalid phone number' };
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[cleanedPhone] = otp;
      return { success: true, message: 'OTP sent successfully', otp }; 
    },
    verifyOtp: async (phoneNumber: string, code: string): Promise<{ success: boolean; token?: string }> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (otpStore[cleanedPhone] === code) {
        const token = `mock-jwt-token-${Date.now()}`;
        localStorage.setItem(DB_KEYS.TOKEN, token);
        delete otpStore[cleanedPhone];
        return { success: true, token };
      }
      return { success: false };
    },
    logout: async () => localStorage.removeItem(DB_KEYS.TOKEN),
    isAuthenticated: () => !!localStorage.getItem(DB_KEYS.TOKEN)
  },
  products: {
    list: async (): Promise<Product[]> => db.get<Product[]>(DB_KEYS.PRODUCTS, seedData.products),
    add: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const products = db.get<Product[]>(DB_KEYS.PRODUCTS, seedData.products);
      const newProduct = { ...product, id: `p${Date.now()}` };
      db.set(DB_KEYS.PRODUCTS, [...products, newProduct]);
      return newProduct;
    },
    update: async (product: Product): Promise<Product> => {
      const products = db.get<Product[]>(DB_KEYS.PRODUCTS, seedData.products);
      const updated = products.map(p => p.id === product.id ? product : p);
      db.set(DB_KEYS.PRODUCTS, updated);
      return product;
    },
    delete: async (id: string): Promise<void> => {
      const products = db.get<Product[]>(DB_KEYS.PRODUCTS, seedData.products);
      db.set(DB_KEYS.PRODUCTS, products.filter(p => p.id !== id));
    }
  },
  customers: {
    list: async (): Promise<Customer[]> => db.get<Customer[]>(DB_KEYS.CUSTOMERS, seedData.customers),
    add: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
      const customers = db.get<Customer[]>(DB_KEYS.CUSTOMERS, seedData.customers);
      const newCustomer = { ...customer, id: `c${Date.now()}` };
      db.set(DB_KEYS.CUSTOMERS, [...customers, newCustomer]);
      return newCustomer;
    }
  },
  sales: {
    list: async (): Promise<Sale[]> => db.get<Sale[]>(DB_KEYS.SALES, seedData.sales),
    create: async (data: { productId: string; quantity: number; customerName: string; customerCity: string; customerAddress: string }): Promise<void> => {
      const products = db.get<Product[]>(DB_KEYS.PRODUCTS, seedData.products);
      const product = products.find(p => p.id === data.productId);
      
      if (!product) throw new Error("Product not found");
      if (product.stock < data.quantity) throw new Error("Insufficient stock available");

      const customers = db.get<Customer[]>(DB_KEYS.CUSTOMERS, seedData.customers);
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        name: data.customerName,
        city: data.customerCity,
        address: data.customerAddress,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasedProduct: product.name,
        quantity: data.quantity
      };
      db.set(DB_KEYS.CUSTOMERS, [...customers, newCustomer]);

      const sales = db.get<Sale[]>(DB_KEYS.SALES, seedData.sales);
      const newSale: Sale = {
        id: `s${Date.now()}`,
        productId: data.productId,
        customerId: newCustomer.id,
        quantity: data.quantity,
        date: new Date().toISOString().split('T')[0],
        totalRevenue: product.sellingPrice * data.quantity,
        totalProfit: (product.sellingPrice - product.purchasePrice) * data.quantity
      };
      db.set(DB_KEYS.SALES, [...sales, newSale]);

      const updatedProduct = { ...product, stock: product.stock - data.quantity };
      const updatedProducts = products.map(p => p.id === product.id ? updatedProduct : p);
      db.set(DB_KEYS.PRODUCTS, updatedProducts);
    }
  }
};

export const api = USE_REAL_BACKEND ? realApi : mockApi;
