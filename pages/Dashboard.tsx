
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
}
const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-3xl font-bold text-white mt-2 truncate">{value}</p>
    </div>
);

interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}
const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => (
    <div className={`bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        {children}
    </div>
);

const Dashboard: React.FC = () => {
  const { products, customers, sales } = useContext(DataContext);

  const totalStockValue = products.reduce((acc, p) => acc + (p.purchasePrice * p.stock), 0).toFixed(2);
  const topProductByProfit = sales.length > 0 ? products.find(p => p.id === [...sales].sort((a, b) => b.totalProfit - a.totalProfit)[0].productId)?.name : 'N/A';
  
  const cityVolume = customers.reduce((acc: Record<string, number>, c) => {
    acc[c.city] = (acc[c.city] || 0) + c.quantity;
    return acc;
  }, {});

  const topCityByProductsPurchased = customers.length > 0 ? Object.entries(cityVolume).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] : 'N/A';

  const bestCustomer = customers.length > 0 ? [...customers].sort((a, b) => b.quantity - a.quantity)[0].name : 'N/A';
  
  const monthlySalesData = sales.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      const existing = acc.find(d => d.name === month);
      if (existing) {
          existing['Monthly Sales (₹)'] += sale.totalRevenue;
      } else {
          acc.push({ name: month, 'Monthly Sales (₹)': sale.totalRevenue });
      }
      return acc;
  }, [] as {name: string; 'Monthly Sales (₹)': number}[]);

  const productProfitData = products.map(product => {
      const productSales = sales.filter(s => s.productId === product.id);
      const totalProfit = productSales.reduce((acc, s) => acc + s.totalProfit, 0);
      return { name: product.name, 'Profit (₹)': totalProfit };
  }).filter(p => p['Profit (₹)'] > 0).sort((a,b) => b['Profit (₹)'] - a['Profit (₹)']);

  const cityWiseSales = customers.reduce((acc, customer) => {
    acc[customer.city] = (acc[customer.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const citySalesData = Object.keys(cityWiseSales).map(city => ({ name: city, value: cityWiseSales[city] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={products.length} />
        <StatCard title="Total Customers" value={customers.length} />
        <StatCard title="Total Stock Value" value={`₹${totalStockValue}`} />
        <StatCard title="Top Product (Profit)" value={topProductByProfit || 'N/A'} />
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <StatCard title="Top City (by Products Purchased)" value={topCityByProductsPurchased} />
        <StatCard title="Best Customer" value={bestCustomer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Monthly Sales Trend" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Monthly Sales (₹)" stroke="#22d3ee" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top Products by Profit" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productProfitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                    <Bar dataKey="Profit (₹)" fill="#22d3ee" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="City-wise Sales Distribution" className="lg:col-span-1">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={citySalesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                        {citySalesData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-8">
        <ChartCard title="Available Products">
            <ul className="space-y-2">
                {products.map(p => (
                    <li key={p.id} className="text-gray-300">{p.name} - {p.stock} {p.unit}</li>
                ))}
            </ul>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
