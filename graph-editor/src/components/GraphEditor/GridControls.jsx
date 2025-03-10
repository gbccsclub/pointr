import React from 'react';

const GridControls = ({
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  showDistances,
  setShowDistances,
  gridSize,
  setGridSize,
  nodeSize,
  setNodeSize,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="space-y-2">
        <div className="flex gap-3">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="h-3 w-3 rounded border-gray-300 text-blue-600"
            />
            Grid
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="h-3 w-3 rounded border-gray-300 text-blue-600"
            />
            Snap
          </label>

          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showDistances}
              onChange={(e) => setShowDistances(e.target.checked)}
              className="h-3 w-3 rounded border-gray-300 text-blue-600"
            />
            Dist
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span>Grid:</span>
          <input
            type="range"
            min="10"
            max="50"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-20 h-3 accent-blue-600"
          />
          <span className="w-7 text-right">{gridSize}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Node:</span>
          <input
            type="range"
            min="3"
            max="12"
            value={nodeSize}
            onChange={(e) => setNodeSize(Number(e.target.value))}
            className="w-20 h-3 accent-blue-600"
          />
          <span className="w-7 text-right">{nodeSize}</span>
        </div>
      </div>
    </div>
  );
};

export default GridControls;
