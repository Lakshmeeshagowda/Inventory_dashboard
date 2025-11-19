
import type { Product, Customer, Sale } from '../types';

// --- CONFIGURATION ---
// Helper to ensure URL has protocol
const getApiUrl = () => {
    const envUrl = (import.meta as any).env?.VITE_API_URL;
    if (!envUrl) return null;
    if (envUrl.startsWith('http')) return envUrl;
    return `https://${envUrl}`;
};

const ENV_API_URL = getApiUrl();
const USE_REAL_BACKEND = !!ENV_API_URL || false; 
const API_BASE_URL = ENV_API_URL || 'http://localhost:5000/api';

// --- MOCK DATABASE (LocalStorage) ---
const DB_KEYS = {
  PRODUCTS: 'agri_products',
  CUSTOMERS: 'agri_customers',
  SALES: 'agri_sales',
  TOKEN: 'agri_auth_token',
  CURRENT_USER: 'agri_current_user_phone' // To track who is logged in for Mock Mode
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

// In mock mode, we need to know "who" is requesting data
const getMockUser = () => localStorage.getItem(DB_KEYS.CURRENT_USER);

const otpStore: Record<string, string> = {};

// --- REAL API IMPLEMENTATION (Fetch) ---
const realApi = {
  healthCheck: async () => {
    try {
      const rootUrl = API_BASE_URL.replace('/api', '');
      const res = await fetch(rootUrl);
      return res.ok ? 'cloud' : 'offline';
    } catch (e) {
      return 'offline';
    }
  },
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
      if (data.token) {
        localStorage.setItem(DB_KEYS.TOKEN, data.token);
        // We decode the token simply to get the sub for UI purposes, though the backend validates it
        try {
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            localStorage.setItem(DB_KEYS.CURRENT_USER, payload.sub);
        } catch(e) {}
      }
      return data;
    },
    logout: async () => {
      localStorage.removeItem(DB_KEYS.TOKEN);
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },
    isAuthenticated: () => !!localStorage.getItem(DB_KEYS.TOKEN),
    getCurrentUser: () => localStorage.getItem(DB_KEYS.CURRENT_USER)
  },
  products: {
    list: async () => {
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const token = localStorage.getItem(DB_KEYS.TOKEN);
      const res = await fetch(`${API_BASE_URL}/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

// --- MOCK API IMPLEMENTATION (LocalStorage with Multi-Tenancy) ---
// We add an 'ownerId' field to mock data to simulate isolation
const mockApi = {
  healthCheck: async () => 'local',
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
        localStorage.setItem(DB_KEYS.CURRENT_USER, cleanedPhone); // Store who is logged in
        delete otpStore[cleanedPhone];
        return { success: true, token };
      }
      return { success: false };
    },
    logout: async () => {
        localStorage.removeItem(DB_KEYS.TOKEN);
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },
    isAuthenticated: () => !!localStorage.getItem(DB_KEYS.TOKEN),
    getCurrentUser: () => localStorage.getItem(DB_KEYS.CURRENT_USER)
  },
  products: {
    list: async (): Promise<Product[]> => {
        const currentUser = getMockUser();
        const allProducts = db.get<any[]>(DB_KEYS.PRODUCTS, []);
        // Only return products owned by this user
        return allProducts.filter(p => p.ownerId === currentUser);
    },
    add: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const currentUser = getMockUser();
      const products = db.get<any[]>(DB_KEYS.PRODUCTS, []);
      const newProduct = { ...product, id: `p${Date.now()}`, ownerId: currentUser };
      db.set(DB_KEYS.PRODUCTS, [...products, newProduct]);
      return newProduct;
    },
    update: async (product: Product): Promise<Product> => {
      const currentUser = getMockUser();
      const products = db.get<any[]>(DB_KEYS.PRODUCTS, []);
      const updated = products.map(p => (p.id === product.id && p.ownerId === currentUser) ? { ...product, ownerId: currentUser } : p);
      db.set(DB_KEYS.PRODUCTS, updated);
      return product;
    },
    delete: async (id: string): Promise<void> => {
      const currentUser = getMockUser();
      const products = db.get<any[]>(DB_KEYS.PRODUCTS, []);
      db.set(DB_KEYS.PRODUCTS, products.filter(p => !(p.id === id && p.ownerId === currentUser)));
    }
  },
  customers: {
    list: async (): Promise<Customer[]> => {
        const currentUser = getMockUser();
        const all = db.get<any[]>(DB_KEYS.CUSTOMERS, []);
        return all.filter(c => c.ownerId === currentUser);
    },
    add: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
      const currentUser = getMockUser();
      const customers = db.get<any[]>(DB_KEYS.CUSTOMERS, []);
      const newCustomer = { ...customer, id: `c${Date.now()}`, ownerId: currentUser };
      db.set(DB_KEYS.CUSTOMERS, [...customers, newCustomer]);
      return newCustomer;
    }
  },
  sales: {
    list: async (): Promise<Sale[]> => {
        const currentUser = getMockUser();
        const all = db.get<any[]>(DB_KEYS.SALES, []);
        return all.filter(s => s.ownerId === currentUser);
    },
    create: async (data: { productId: string; quantity: number; customerName: string; customerCity: string; customerAddress: string }): Promise<void> => {
      const currentUser = getMockUser();
      
      const products = db.get<any[]>(DB_KEYS.PRODUCTS, []);
      const product = products.find(p => p.id === data.productId && p.ownerId === currentUser);
      
      if (!product) throw new Error("Product not found");
      if (product.stock < data.quantity) throw new Error("Insufficient stock available");

      const customers = db.get<any[]>(DB_KEYS.CUSTOMERS, []);
      const newCustomer = {
        id: `c${Date.now()}`,
        ownerId: currentUser,
        name: data.customerName,
        city: data.customerCity,
        address: data.customerAddress,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasedProduct: product.name,
        quantity: data.quantity
      };
      db.set(DB_KEYS.CUSTOMERS, [...customers, newCustomer]);

      const sales = db.get<any[]>(DB_KEYS.SALES, []);
      const newSale = {
        id: `s${Date.now()}`,
        ownerId: currentUser,
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
