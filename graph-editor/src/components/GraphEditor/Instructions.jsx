import React from 'react';

const Instructions = ({ nodes, edges, gridSize, selectedNode }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 backdrop-blur-sm bg-opacity-90 w-64">
      <h3 className="font-medium text-sm mb-3 text-slate-700">Instructions</h3>
      <ul className="text-sm space-y-1 text-slate-600 mb-4">
        <li>• Click anywhere to create a node</li>
        <li>• Click a node to select it</li>
        <li>• Drag from a node to create an edge</li>
        <li>• Press Delete to remove selected node</li>
        <li>• Press Ctrl+Z to undo</li>
      </ul>
      
      <h4 className="font-medium text-sm mb-2 text-slate-700">Statistics</h4>
      <ul className="text-sm space-y-1 text-slate-600">
        <li>Nodes: {nodes.length}</li>
        <li>Edges: {edges.length}</li>
        <li>Grid Size: {gridSize}px</li>
        {selectedNode && (
          <li>Selected: {selectedNode.label} ({selectedNode.x}, {selectedNode.y})</li>
        )}
      </ul>
    </div>
  );
};

export default Instructions;
