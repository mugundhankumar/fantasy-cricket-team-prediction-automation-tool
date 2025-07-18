import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Upload, Lock, Target, Download } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Zap },
    { name: 'Upload Team', path: '/upload', icon: Upload },
    { name: 'Lock Core Players', path: '/lock', icon: Lock },
    { name: 'C/VC Strategy', path: '/strategy', icon: Target },
    { name: 'Export Teams', path: '/export', icon: Download },
  ];

  return (
    <aside className="w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-4">
      <nav className="space-y-4">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded text-gray-300 hover:text-white hover:bg-white/10 ${
                isActive ? 'bg-white/20 font-semibold' : ''
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
