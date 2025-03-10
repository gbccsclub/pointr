import React, { useState } from 'react';
import { generateCypherExport, parseCypherImport } from '../../utils/neo4jConverter';

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

const Neo4jControls = ({ nodes, edges, onImport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cypherQuery, setCypherQuery] = useState('');
  const [mode, setMode] = useState('export');

  const handleExport = () => {
    const cypher = generateCypherExport(nodes, edges);
    setCypherQuery(cypher);
    setMode('export');
    setIsOpen(true);
  };

  const handleImport = () => {
    try {
      const { nodes: importedNodes, edges: importedEdges, nodeCounter, roomCounter } = parseCypherImport(cypherQuery);
      onImport(importedNodes, importedEdges, nodeCounter, roomCounter);
      setIsOpen(false);
      setCypherQuery('');
    } catch (error) {
      console.error('Import error:', error);
      alert('Invalid Cypher format');
    }
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
        title="Export/Import Neo4j"
      >
        <Icons.Neo4j />
      </button>

      {isOpen && (
        <div className="fixed top-4 left-20 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg w-[480px]">
            {/* Header with mode toggle */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('export')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    mode === 'export'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Export
                </button>
                <button
                  onClick={() => setMode('import')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    mode === 'import'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Import
                </button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <Icons.Cancel />
              </button>
            </div>

            {/* Content */}
            <div className="p-3">
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  {mode === 'export' ? (
                    <>Generated Cypher query for {nodes.length} nodes and {edges.length} edges:</>
                  ) : (
                    <>Paste your Cypher query below to import nodes and edges:</>
                  )}
                </div>
                <textarea
                  value={cypherQuery}
                  onChange={(e) => setCypherQuery(e.target.value)}
                  className="w-full h-[200px] p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={mode === 'import' ? "CREATE (n1:Node {...}) ..." : ""}
                  readOnly={mode === 'export'}
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
              {mode === 'export' ? (
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  Copy to Clipboard
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                >
                  Import
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Neo4jControls;
