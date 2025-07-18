import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const GlobalSearchFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [creditFilter, setCreditFilter] = useState('');
  const [performanceTier, setPerformanceTier] = useState('');

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 bg-opacity-90 backdrop-blur-md p-4 z-50 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
      <div className="flex items-center space-x-2 flex-1 max-w-md">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search matches or players..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded px-3 py-2 bg-gray-800 text-white focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded px-3 py-2 bg-gray-800 text-white"
        >
          <option value="">All Roles</option>
          <option value="batsman">Batsman</option>
          <option value="bowler">Bowler</option>
          <option value="allrounder">Allrounder</option>
          <option value="wicketkeeper">Wicketkeeper</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={creditFilter}
          onChange={e => setCreditFilter(e.target.value)}
          className="rounded px-3 py-2 bg-gray-800 text-white"
        >
          <option value="">All Credits</option>
          <option value="low">Low {'(<8)'}</option>
          <option value="medium">Medium (8-10)</option>
          <option value="high">High {'(>10)'}</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={performanceTier}
          onChange={e => setPerformanceTier(e.target.value)}
          className="rounded px-3 py-2 bg-gray-800 text-white"
        >
          <option value="">All Performance Tiers</option>
          <option value="top">Top Tier</option>
          <option value="mid">Mid Tier</option>
          <option value="low">Low Tier</option>
        </select>
      </div>
    </div>
  );
};

export default GlobalSearchFilter;
