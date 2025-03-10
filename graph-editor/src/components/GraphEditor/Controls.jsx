import React from 'react';
import Neo4jControls from './Neo4jControls';

const Controls = ({
  handleUndo,
  canUndo,
  selectedNode,
  onDeleteNode,
  image,
  opacity,
  onImageUpload,
  onOpacityChange,
  onImageToggle,
  nodes,
  edges,
  onImport,
  editorMode,
  onModeChange
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="flex items-center gap-2">
        {/* Left side: Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`px-2 py-0.5 rounded transition-colors ${
              canUndo 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Undo
          </button>

          <button
            onClick={() => onModeChange(editorMode === 'node' ? 'edge' : 'node')}
            className="px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors flex items-center gap-1"
          >
            {editorMode === 'node' ? '🔵 Node' : '↔️ Edge'}
          </button>

          {selectedNode && (
            <button
              onClick={onDeleteNode}
              className="px-2 py-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
            >
              Delete
            </button>
          )}

          <Neo4jControls
            nodes={nodes}
            edges={edges}
            onImport={onImport}
          />
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-200"></div>

        {/* Right side: Image controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="w-24 text-xs file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
          />
          
          {image && (
            <>
              <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={opacity > 0}
                  onChange={(e) => onImageToggle(e.target.checked)}
                  className="h-3 w-3 rounded border-gray-300 text-blue-600"
                />
                Show
              </label>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => onOpacityChange(e.target.value)}
                className="w-16 h-2 accent-blue-600"
              />
              <span className="text-gray-600 w-6">
                {Math.round(opacity * 100)}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;
