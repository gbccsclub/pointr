import React from 'react';

const Controls = ({
  handleUndo,
  canUndo,
  selectedNode,
  onDeleteNode
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            canUndo 
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }`}
        >
          Undo
        </button>

        {selectedNode && (
          <button
            onClick={onDeleteNode}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            Delete Node
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;
