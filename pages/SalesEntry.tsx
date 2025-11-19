
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

const SalesEntry: React.FC = () => {
  const { products, addSale } = useContext(DataContext);
  const { showToast } = useToast();
  
  const [productId, setProductId] = useState(products.length > 0 ? products[0].id : '');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0 || !customerName || !customerCity || !customerAddress) {
        showToast('Please fill all fields correctly.', 'error');
        return;
    }
    
    try {
        await addSale({ productId, quantity, customerName, customerCity, customerAddress });
        // Success handled by DataContext toast
        
        // Reset form
        setProductId(products.length > 0 ? products[0].id : '');
        setQuantity(1);
        setCustomerName('');
        setCustomerCity('');
        setCustomerAddress('');
    } catch (error) {
        // Error handled by DataContext toast
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Sales Entry</h1>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 max-w-lg mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="product">
              Product
            </label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="quantity">
              Sold Quantity
            </label>
            <input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              min="1"
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerName">
              Customer Name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerCity">
              Customer City
            </label>
            <input
              id="customerCity"
              type="text"
              value={customerCity}
              onChange={(e) => setCustomerCity(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
           <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="customerAddress">
              Customer Address
            </label>
            <input
              id="customerAddress"
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Record Sale
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalesEntry;
