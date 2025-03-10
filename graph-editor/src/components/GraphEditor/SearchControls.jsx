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
  PathNode: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4m-12 0h-4" />
    </svg>
  ),
  Room: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16M9 4v16" />
    </svg>
  ),
};

const SearchControls = ({ nodes, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [nodeTypeFilter, setNodeTypeFilter] = useState('pathNode');

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredNodes([]);
      return;
    }

    const filtered = nodes
      .filter(node => 
        node.type === nodeTypeFilter && 
        (node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (node.label && node.label.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .slice(0, 5);

    setFilteredNodes(filtered);
  }, [searchTerm, nodes, nodeTypeFilter]);

  const handleSelect = (node) => {
    onNodeSelect(node);
    setSearchTerm('');
    setIsOpen(false);
  };

  const toggleNodeType = () => {
    setNodeTypeFilter(current => current === 'pathNode' ? 'roomNode' : 'pathNode');
    setSearchTerm('');
    setFilteredNodes([]);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="relative">
        <div className="flex gap-2">
          {/* Single toggle button */}
          <button
            onClick={toggleNodeType}
            className="flex items-center px-2 py-1.5 rounded-md border bg-white hover:bg-gray-50 transition-colors"
            title={`Currently searching ${nodeTypeFilter === 'pathNode' ? 'path' : 'room'} nodes. Click to toggle.`}
          >
            {nodeTypeFilter === 'pathNode' ? <Icons.PathNode /> : <Icons.Room />}
          </button>

          {/* Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={`Search ${nodeTypeFilter === 'pathNode' ? 'path' : 'room'} nodes...`}
              className="w-full pl-8 pr-8 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
              <Icons.Search />
            </div>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
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
                  <div className="text-sm text-gray-500">{node.label}</div>
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
