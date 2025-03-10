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
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[280px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show Grid
          </label>

          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Snap to Grid
          </label>

          <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={showDistances}
              onChange={(e) => setShowDistances(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show Distances
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm whitespace-nowrap">
            Grid Size:
            <input
              type="range"
              min="10"
              max="50"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="w-32 accent-blue-600"
            />
            <span className="w-8 text-right">{gridSize}px</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GridControls;