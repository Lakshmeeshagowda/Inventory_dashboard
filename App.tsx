
import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import SalesEntry from './pages/SalesEntry';
import StockMonitoring from './pages/StockMonitoring';
import Reports from './pages/Reports';
import CustomerDetails from './pages/CustomerDetails';
import { LayoutDashboard, ShoppingCart, BarChart3, Package, Users, FileText } from 'lucide-react';
import type { NavItem } from './types';

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Product Management', icon: Package },
  { name: 'Sales Entry', icon: ShoppingCart },
  { name: 'Stock Monitoring', icon: BarChart3 },
  { name: 'Reports', icon: FileText },
  { name: 'Customer Details', icon: Users },
];

const MainApp = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Product Management':
        return <ProductManagement />;
      case 'Sales Entry':
        return <SalesEntry />;
      case 'Stock Monitoring':
        return <StockMonitoring />;
      case 'Reports':
        return <Reports />;
      case 'Customer Details':
        return <CustomerDetails />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-slate-900 text-gray-200">
        <Sidebar 
          navItems={navItems} 
          activePage={activePage} 
          setActivePage={setActivePage} 
          logout={logout}
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
        />
        <main className="flex-1 transition-all duration-300 md:ml-64">
          <div className="p-4 md:p-8 mt-12 md:mt-0">
            {renderPage()}
          </div>
        </main>
      </div>
    </DataProvider>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
