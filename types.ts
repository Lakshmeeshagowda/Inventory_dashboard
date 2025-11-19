
import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'bag' | 'litre';
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  address: string;
  purchaseDate: string;
  purchasedProduct: string;
  quantity: number;
}

export interface Sale {
  id: string;
  productId: string;
  customerId: string;
  quantity: number;
  date: string;
  totalRevenue: number;
  totalProfit: number;
}

export interface NavItem {
    name: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
