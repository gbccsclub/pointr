import React, { useState } from 'react';

const Instructions = ({ nodes, edges, gridSize, selectedNode, selectedEdge, editorMode }) => {
  const [isVisible, setIsVisible] = useState(true);

  const getModeInstructions = () => {
    switch (editorMode) {
      case 'select':
        return (
          <>
            <li className="font-medium text-blue-600">Select Mode</li>
            <li>• Click to select nodes/edges</li>
            <li>• Click + drag to move nodes</li>
            <li>• Del to remove selected</li>
            <li>• Click empty space to deselect</li>
          </>
        );
      case 'pathNode':
        return (
          <>
            <li className="font-medium text-blue-600">Create Path Node Mode</li>
            <li>• Click empty space to create node</li>
          </>
        );
      case 'roomNode':
        return (
          <>
            <li className="font-medium text-blue-600">Create Room Node Mode</li>
            <li>• Click empty space to create node</li>
          </>
        );
      case 'edge':
        return (
          <>
            <li className="font-medium text-blue-600">Create Edge Mode</li>
            <li>• Click first node to start edge</li>
            <li>• Click second node to complete</li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs w-56">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-medium text-slate-700">Instructions</span>
        <span className="text-slate-500 text-[10px]">({nodes.length} nodes, {edges.length} edges)</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="ml-auto p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          title={isVisible ? "Hide instructions" : "Show instructions"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isVisible ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>
      
      {isVisible && (
        <>
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
        </>
      )}
    </div>
  );
};

export default Instructions;
