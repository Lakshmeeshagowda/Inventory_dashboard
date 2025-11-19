
import React from 'react';
import type { NavItem } from '../types';
import { LogOut, Menu, X, Leaf } from 'lucide-react';

interface SidebarProps {
  navItems: NavItem[];
  activePage: string;
  setActivePage: (page: string) => void;
  logout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, activePage, setActivePage, logout, isOpen, setIsOpen }) => {
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
