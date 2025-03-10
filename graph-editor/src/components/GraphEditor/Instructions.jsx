import React from 'react';

const Instructions = ({ nodes, edges, gridSize, selectedNode, selectedEdge, editorMode }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs w-48">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-medium text-slate-700">Instructions</span>
        <span className="text-slate-500">{nodes.length} nodes, {edges.length} edges</span>
      </div>
      <ul className="space-y-0.5 text-slate-600 mb-1">
        <li>• Mode: {editorMode === 'node' ? 'Create Nodes' : 'Create Edges'}</li>
        {editorMode === 'node' ? (
          <>
            <li>• Click to create node</li>
            <li>• Drag to move node</li>
          </>
        ) : (
          <li>• Click nodes to connect</li>
        )}
        <li>• Click node/edge to select</li>
        <li>• Del to remove selected</li>
        <li>• Ctrl+Z to undo</li>
      </ul>
      {selectedNode && (
        <div className="text-slate-500">
          Selected: Node {selectedNode.label} ({selectedNode.x}, {selectedNode.y})
        </div>
      )}
      {selectedEdge && (
        <div className="text-slate-500">
          Selected: Edge {selectedEdge.id}
        </div>
      )}
    </div>
  );
};

export default Instructions;
