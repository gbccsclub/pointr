import React from 'react';

const Instructions = ({ nodes, edges, gridSize, selectedNode, selectedEdge, editorMode }) => {
  const getModeInstructions = () => {
    if (editorMode === 'node') {
      return (
        <>
          <li className="font-medium text-blue-600">Create Node Mode</li>
          <li>• Click empty space to create node</li>
          <li>• Click + drag to move existing nodes</li>
          <li>• Click node to select</li>
          <li>• Del to remove selected node</li>
        </>
      );
    } else {
      return (
        <>
          <li className="font-medium text-blue-600">Create Edge Mode</li>
          <li>• Click first node to start edge</li>
          <li>• Click second node to complete</li>
          <li>• Click edge to select</li>
          <li>• Del to remove selected edge</li>
        </>
      );
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs w-48">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-medium text-slate-700">Instructions</span>
        <span className="text-slate-500">{nodes.length} nodes, {edges.length} edges</span>
      </div>
      <ul className="space-y-0.5 text-slate-600 mb-1">
        {getModeInstructions()}
        <li className="mt-1">• Ctrl+Z to undo</li>
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
