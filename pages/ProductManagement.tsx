import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import type { Product } from '../types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  category: '',
  unit: 'kg',
  purchasePrice: 0,
  sellingPrice: 0,
  stock: 0,
};

const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useContext(DataContext);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        category: editingProduct.category,
        unit: editingProduct.unit,
        purchasePrice: editingProduct.purchasePrice,
        sellingPrice: editingProduct.sellingPrice,
        stock: editingProduct.stock,
      });
      setIsFormVisible(true);
    } else {
      setFormData(emptyProduct);
    }
  }, [editingProduct]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['purchasePrice', 'sellingPrice', 'stock'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...formData });
    } else {
      addProduct(formData);
    }
    handleCancel();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };
  
  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        deleteProduct(productId);
    }
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Product Management</h1>
        <button
          onClick={() => { setEditingProduct(null); setIsFormVisible(true); }}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4">Name</th>
                  <th className="p-4 hidden md:table-cell">Category</th>
                  <th className="p-4 hidden sm:table-cell">Unit</th>
                  <th className="p-4">Purchase</th>
                  <th className="p-4">Selling</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 hidden lg:table-cell">Total</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="p-4">{product.name}</td>
                    <td className="p-4 hidden md:table-cell">{product.category}</td>
                    <td className="p-4 hidden sm:table-cell">{product.unit}</td>
                    <td className="p-4">₹{product.purchasePrice.toFixed(2)}</td>
                    <td className="p-4">₹{product.sellingPrice.toFixed(2)}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4 hidden lg:table-cell">₹{(product.purchasePrice * product.stock).toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                          <button onClick={() => handleEdit(product)} className="p-2 bg-yellow-500/20 text-yellow-400 rounded-md hover:bg-yellow-500/40"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {isFormVisible && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter product name" required className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <input type="text" name="category" value={formData.category} onChange={handleInputChange} placeholder="Enter category" required className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option value="kg">kg</option>
                      <option value="bag">bag</option>
                      <option value="litre">litre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price (₹)</label>
                  <input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} placeholder="Enter purchase price" required className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Selling Price (₹)</label>
                  <input type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} placeholder="Enter selling price" required className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Enter stock quantity" required className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Save</button>
                <button type="button" onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
