
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PlusCircle, X } from 'lucide-react';

const CustomerDetails: React.FC = () => {
    const { customers, products, addSale } = useContext(DataContext);
    const { showToast } = useToast();
    const [isFormVisible, setIsFormVisible] = useState(false);

    const [customerName, setCustomerName] = useState('');
    const [customerCity, setCustomerCity] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [productId, setProductId] = useState(products.length > 0 ? products[0].id : '');
    const [quantity, setQuantity] = useState(1);

    const resetForm = () => {
        setCustomerName('');
        setCustomerCity('');
        setCustomerAddress('');
        setCustomerPhone('');
        setProductId(products.length > 0 ? products[0].id : '');
        setQuantity(1);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || quantity <= 0 || !customerName || !customerCity || !customerAddress || !customerPhone) {
            showToast('Please fill all fields correctly.', 'error');
            return;
        }
        try {
            await addSale({ productId, quantity, customerName, customerCity, customerAddress, customerPhone });
            setIsFormVisible(false);
            resetForm();
            // Success toast is handled in DataContext
        } catch (error) {
            // Error toast is handled in DataContext
        }
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Customer Details</h1>
        <button
          onClick={() => setIsFormVisible(prev => !prev)}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          {isFormVisible ? <X size={20} className="mr-2" /> : <PlusCircle size={20} className="mr-2" />}
          {isFormVisible ? 'Close Form' : 'Add Customer'}
        </button>
      </div>
      
      {isFormVisible && (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Customer & First Purchase</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer Name" required className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone Number" required className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="text" value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} placeholder="City" required className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="Address" required className="md:col-span-2 bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} placeholder="Quantity Purchased" min="1" required className="bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div className="flex space-x-4 mt-6">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Add Customer</button>
              </div>
            </form>
        </div>
      )}

      <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4 hidden sm:table-cell">City</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="p-4">{customer.name}</td>
                    <td className="p-4">{customer.phoneNumber}</td>
                    <td className="p-4 hidden sm:table-cell">{customer.city}</td>
                    <td className="p-4">{customer.purchasedProduct}</td>
                    <td className="p-4">{customer.quantity}</td>
                    <td className="p-4">{customer.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
