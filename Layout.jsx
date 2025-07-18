import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
