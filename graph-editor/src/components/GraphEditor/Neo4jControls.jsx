import React, { useState } from 'react';
import { generateCypherExport, parseCypherImport } from '../../utils/neo4jConverter';

const Neo4jControls = ({ nodes, edges, onImport }) => {
  const [showModal, setShowModal] = useState(false);
  const [cypherQuery, setCypherQuery] = useState('');
  const [mode, setMode] = useState('export'); // 'export' or 'import'

  const handleExport = () => {
    const cypher = generateCypherExport(nodes, edges);
    setCypherQuery(cypher);
    setMode('export');
    setShowModal(true);
  };

  const handleImport = () => {
    try {
      const { nodes: importedNodes, edges: importedEdges } = parseCypherImport(cypherQuery);
      onImport(importedNodes, importedEdges);
      setShowModal(false);
      setCypherQuery('');
    } catch (error) {
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
      <div className="relative inline-block">
        <button
          onClick={handleExport}
          className="px-2 py-0.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors text-xs"
        >
          Neo4j
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Neo4j Cypher Query</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('export')}
                className={`px-3 py-1 rounded text-sm ${
                  mode === 'export'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Export
              </button>
              <button
                onClick={() => setMode('import')}
                className={`px-3 py-1 rounded text-sm ${
                  mode === 'import'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Import
              </button>
            </div>
            
            <textarea
              value={cypherQuery}
              onChange={(e) => setCypherQuery(e.target.value)}
              className="w-full h-64 p-2 border rounded font-mono text-sm"
              placeholder={mode === 'import' ? "Paste Cypher query here for import..." : "Generated Cypher query will appear here..."}
              readOnly={mode === 'export'}
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {mode === 'export' ? (
                <button
                  onClick={handleCopyToClipboard}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Copy to Clipboard
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
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
