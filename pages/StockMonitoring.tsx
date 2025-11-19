import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';

const StockMonitoring: React.FC = () => {
  const { products } = useContext(DataContext);

  const getStatus = (stock: number) => {
    if (stock <= 0) return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 font-bold">Out of Stock</span>;
    if (stock < 10) return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 font-bold">Low Stock</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-bold">OK</span>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Stock Monitoring</h1>
      <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4">Name</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800">
                    <td className="p-4">{product.name}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">{getStatus(product.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default StockMonitoring;
