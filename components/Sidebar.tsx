
import React, { useEffect, useState, useContext } from 'react';
import type { NavItem } from '../types';
import { LogOut, Menu, X, Leaf, User } from 'lucide-react';
import { api } from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface SidebarProps {
  navItems: NavItem[];
  activePage: string;
  setActivePage: (page: string) => void;
  logout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activePage, setActivePage, logout, isOpen, setIsOpen }) => {
  const { currentUser } = useContext(AuthContext);
  const [status, setStatus] = useState<'cloud' | 'local' | 'offline'>('local');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
        setIsChecking(true);
        const result = await api.healthCheck();
        setStatus(result as any);
        setIsChecking(false);
    };
    checkStatus();
    
    // Poll every 30 seconds to keep status updated
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (page: string) => {
    setActivePage(page);
    if(window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 mb-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Leaf className="text-cyan-400" size={28}/>
            <h1 className="text-2xl font-bold text-white">Agri-Ferti</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="px-4 mb-4">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex items-center space-x-3">
            <div className="bg-cyan-500/20 p-2 rounded-full">
                <User size={20} className="text-cyan-400"/>
            </div>
            <div className="overflow-hidden">
                <p className="text-xs text-gray-400 uppercase font-bold">Logged in as</p>
                <p className="text-sm text-white font-mono truncate">{currentUser || 'User'}</p>
            </div>
        </div>
      </div>

      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="px-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.name);
                }}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                  activePage === item.name
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="mr-3" size={20} />
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto bg-slate-900/50 mx-4 rounded-lg mb-4 border border-slate-700">
         <h4 className="text-xs text-gray-400 uppercase font-bold mb-3 flex items-center">
            System Status
         </h4>
         <div className="flex items-center space-x-2 text-sm">
            {isChecking ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <span className="text-gray-300">Checking...</span>
                </>
            ) : status === 'cloud' ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-green-400 font-medium">Online (Cloud DB)</span>
                </>
            ) : status === 'local' ? (
                <>
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-orange-400 font-medium">Local Mode</span>
                </>
            ) : (
                <>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-red-400 font-medium">Server Offline</span>
                </>
            )}
         </div>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-200"
        >
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );


  return (
    <>
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-800/95 backdrop-blur-sm z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {sidebarContent}
      </div>
      <button onClick={() => setIsOpen(true)} className="fixed top-4 left-4 z-40 md:hidden p-2 bg-slate-800 rounded-md text-white">
        <Menu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
