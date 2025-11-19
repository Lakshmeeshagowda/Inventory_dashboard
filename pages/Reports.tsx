import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import type { Sale } from '../types';
import { Download, Search, X } from 'lucide-react';

const Reports: React.FC = () => {
    const { sales, products } = useContext(DataContext);
    const [reportType, setReportType] = useState('Monthly');
    const [selectedDate, setSelectedDate] = useState('');
    const [filteredSales, setFilteredSales] = useState<Sale[] | null>(null);

    const generateReport = () => {
        if (!selectedDate) {
            setFilteredSales(sales);
            return;
        }

        const newFilteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            const filterDate = new Date(selectedDate);
            switch(reportType) {
                case 'Daily':
                    return saleDate.toDateString() === filterDate.toDateString();
                case 'Monthly':
                    return saleDate.getMonth() === filterDate.getMonth() && saleDate.getFullYear() === filterDate.getFullYear();
                case 'Yearly':
                     return saleDate.getFullYear() === filterDate.getFullYear();
                default:
                    return true;
            }
        });
        
        setFilteredSales(newFilteredSales);
    };

    const clearReport = () => {
        setFilteredSales(null);
        setSelectedDate('');
    };
    
    const displayedSales = filteredSales !== null ? filteredSales : sales;

    const downloadCSV = () => {
        const headers = ['Date', 'Product', 'Qty', 'Revenue', 'Profit'];
        const rows = displayedSales.map(sale => {
            const product = products.find(p => p.id === sale.productId);
            return [
                sale.date,
                product ? product.name : 'N/A',
                sale.quantity,
                sale.totalRevenue.toFixed(2),
                sale.totalProfit.toFixed(2)
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const totalRevenue = useMemo(() => displayedSales.reduce((sum, s) => sum + s.totalRevenue, 0), [displayedSales]);
    const totalProfit = useMemo(() => displayedSales.reduce((sum, s) => sum + s.totalProfit, 0), [displayedSales]);


  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Reports</h1>
      
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>Daily</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </select>
            </div>
            <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
            </div>
            <div className="flex space-x-2">
                <button onClick={generateReport} className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"><Search size={16} className="mr-2"/> Generate</button>
                <button onClick={downloadCSV} className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"><Download size={16} className="mr-2"/> CSV</button>
                <button onClick={clearReport} className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"><X size={16} className="mr-2"/> Clear</button>
            </div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">{filteredSales ? 'Filtered' : 'All'} Sales Report</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4">Date</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4">Profit</th>
                </tr>
              </thead>
              <tbody>
                {displayedSales.map(sale => {
                    const product = products.find(p => p.id === sale.productId);
                    return (
                        <tr key={sale.id} className="border-b border-slate-800 hover:bg-slate-800">
                            <td className="p-4">{sale.date}</td>
                            <td className="p-4">{product ? product.name : 'N/A'}</td>
                            <td className="p-4">{sale.quantity}</td>
                            <td className="p-4">₹{sale.totalRevenue.toFixed(2)}</td>
                            <td className="p-4">₹{sale.totalProfit.toFixed(2)}</td>
                        </tr>
                    )
                })}
                 {displayedSales.length === 0 && (
                    <tr>
                        <td colSpan={5} className="text-center p-8 text-gray-400">No data available for this period.</td>
                    </tr>
                 )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 font-bold">
                    <td colSpan={3} className="p-4 text-right">Total:</td>
                    <td className="p-4">₹{totalRevenue.toFixed(2)}</td>
                    <td className="p-4">₹{totalProfit.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
