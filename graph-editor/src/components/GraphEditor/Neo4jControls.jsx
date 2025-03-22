import React, { useState } from 'react';
import { generateCypherExport } from '../../utils/neo4jConverter';

// Add Icons object with Neo4j and Cancel icons
const Icons = {
  Neo4j: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7c0-2.21-3.582-4-8-4S4 4.79 4 7m16 0v10c0 2.21-3.582 4-8 4s-8-1.79-8-4V7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c0 2.21 3.582 4 8 4s8-1.79 8-4" />
    </svg>
  ),
  Cancel: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const Neo4jControls = ({ nodes, edges }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cypherQuery, setCypherQuery] = useState('');

  const handleExport = () => {
    const cypher = generateCypherExport(nodes, edges);
    setCypherQuery(cypher);
    setIsOpen(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cypherQuery);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        title="Export to Neo4j"
      >
        <Icons.Neo4j />
      </button>

      {isOpen && (
        <div className="fixed top-4 left-20 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg w-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <div className="text-sm font-medium">Neo4j Export</div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Icons.Cancel />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  Generated Cypher query for {nodes.length} nodes and {edges.length} edges:
                </div>
                <textarea
                  value={cypherQuery}
                  readOnly
                  className="w-full h-[200px] p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Neo4jControls;
