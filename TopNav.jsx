import React from 'react';
import { Bell, Search, MessageCircle, Zap } from 'lucide-react';

const TopNav = () => {
  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              GL Genie
            </span>
          </div>
          <div className="hidden md:flex space-x-6">
            {['Dashboard', 'Match Center', 'Team Generator', 'Stats', 'My Teams', 'Settings'].map((item) => (
              <button
                key={item}
                className="text-gray-300 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-white bg-transparent border-none cursor-pointer p-1 rounded">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-gray-300 hover:text-white bg-transparent border-none cursor-pointer p-1 rounded">
            <Bell className="h-5 w-5" />
          </button>
          <div className="rounded-full bg-gray-700 h-8 w-8 flex items-center justify-center text-white font-semibold">
            U
          </div>
          <button className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all text-white flex items-center justify-center">
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
