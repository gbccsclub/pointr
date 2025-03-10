import React from 'react';

const Controls = ({
  handleUndo,
  canUndo,
  selectedNode,
  onDeleteNode,
  image,
  opacity,
  onImageUpload,
  onOpacityChange,
  onImageToggle
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex flex-col gap-4">
        {/* Undo and Delete buttons */}
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

        {/* Image controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
          </div>
          
          {image && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={opacity > 0}
                  onChange={(e) => onImageToggle(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Show Image
              </label>
              
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => onOpacityChange(e.target.value)}
                  className="w-full accent-blue-600"
                />
                <span className="text-sm text-gray-600 w-12">
                  {Math.round(opacity * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;
