import React, { useState, useEffect } from 'react';

const Icons = {
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Clear: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const SearchControls = ({ nodes, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNodes([]);
      return;
    }

    const filtered = nodes
      .filter(node => 
        node.type === 'pathNode' && 
        (node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (node.label && node.label.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .slice(0, 5); // Limit to 5 results

    setFilteredNodes(filtered);
  }, [searchTerm, nodes]);

  const handleSelect = (node) => {
    onNodeSelect(node);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="relative">
        <div className="flex items-center gap-1">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Search nodes..."
              className="pl-7 pr-2 py-1 w-32 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="absolute left-2 text-gray-400">
              <Icons.Search />
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <Icons.Clear />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown results */}
        {isOpen && filteredNodes.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-50">
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => handleSelect(node)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              >
                <div className="font-medium">{node.id}</div>
                {node.label && (
                  <div className="text-gray-500 text-xs">{node.label}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchControls;