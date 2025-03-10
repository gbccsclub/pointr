import React from 'react';

const Instructions = ({ nodes, edges, gridSize, selectedNode }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs w-48">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-medium text-slate-700">Instructions</span>
        <span className="text-slate-500">{nodes.length} nodes, {edges.length} edges</span>
      </div>
      <ul className="space-y-0.5 text-slate-600 mb-1">
        <li>• Click to create node</li>
        <li>• Click node to select</li>
        <li>• Drag from node for edge</li>
        <li>• Del to remove node</li>
        <li>• Ctrl+Z to undo</li>
      </ul>
      {selectedNode && (
        <div className="text-slate-500">
          Selected: {selectedNode.label} ({selectedNode.x}, {selectedNode.y})
        </div>
      )}
    </div>
  );
};

export default Instructions;
