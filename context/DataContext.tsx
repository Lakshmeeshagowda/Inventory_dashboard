
import React, { createContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, Customer, Sale } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface DataContextType {
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    isLoading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
    addSale: (sale: { productId: string; quantity: number; customerName: string; customerCity: string; customerAddress: string; }) => Promise<void>;
}

export const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Function to sync state with backend database
    const refreshData = useCallback(async () => {
        try {
            const [p, c, s] = await Promise.all([
                api.products.list(),
                api.customers.list(),
                api.sales.list()
            ]);
            setProducts(p);
            setCustomers(c);
            setSales(s);
        } catch (error) {
            console.error("Failed to fetch data from backend", error);
            showToast("Failed to sync data", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    // Initial Load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
        try {
            await api.products.add(productData);
            await refreshData();
            showToast('Product added successfully', 'success');
        } catch (e) {
            showToast('Failed to add product', 'error');
        }
    }, [refreshData, showToast]);

    const updateProduct = useCallback(async (updatedProduct: Product) => {
        try {
            await api.products.update(updatedProduct);
            await refreshData();
            showToast('Product updated successfully', 'success');
        } catch (e) {
            showToast('Failed to update product', 'error');
        }
    }, [refreshData, showToast]);

    const deleteProduct = useCallback(async (productId: string) => {
        try {
            await api.products.delete(productId);
            await refreshData();
            showToast('Product deleted successfully', 'info');
        } catch (e) {
             showToast('Failed to delete product', 'error');
        }
    }, [refreshData, showToast]);
    
    const addCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
        try {
            await api.customers.add(customerData);
            await refreshData();
            showToast('Customer added successfully', 'success');
        } catch (e) {
            showToast('Failed to add customer', 'error');
        }
    }, [refreshData, showToast]);

    const addSale = useCallback(async (saleData: { productId: string; quantity: number; customerName: string, customerCity: string, customerAddress: string }) => {
        try {
            await api.sales.create(saleData);
            await refreshData(); // Refresh to show updated stock and new customer/sale
            showToast('Sale recorded & Stock updated!', 'success');
        } catch (error: any) {
            showToast(`Transaction Failed: ${error.message}`, 'error');
            throw error; // Re-throw so UI knows it failed
        }
    }, [refreshData, showToast]);

    const value = useMemo(() => ({
        products,
        customers,
        sales,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        addSale
    }), [products, customers, sales, isLoading, addProduct, updateProduct, deleteProduct, addCustomer, addSale]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
