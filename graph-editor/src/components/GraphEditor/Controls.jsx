import React from 'react';
import Neo4jControls from './Neo4jControls';

// SVG Icons as components for better reusability
const Icons = {
  Undo: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  Node: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
    </svg>
  ),
  Edge: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m-7-7l7 7-7 7" />
    </svg>
  ),
  Delete: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
};

const Controls = ({
  handleUndo,
  canUndo,
  selectedNode,
  selectedEdge,
  onDeleteNode,
  onDeleteEdge,
  image,
  opacity,
  onImageUpload,
  onOpacityChange,
  onImageToggle,
  nodes,
  edges,
  onImport,
  editorMode,
  onModeChange,
  onClearData
}) => {
  const handleImageInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        onImageUpload(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="flex items-center gap-2">
        {/* Left side: Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo 
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Icons.Undo />
          </button>

          <button
            onClick={() => onModeChange(editorMode === 'node' ? 'edge' : 'node')}
            className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            title={editorMode === 'node' ? 'Switch to Edge Mode' : 'Switch to Node Mode'}
          >
            {editorMode === 'node' ? <Icons.Node /> : <Icons.Edge />}
          </button>

          {(selectedNode || selectedEdge) && (
            <button
              onClick={selectedNode ? onDeleteNode : onDeleteEdge}
              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
              title={`Delete Selected ${selectedNode ? 'Node' : 'Edge'} (Del)`}
            >
              <Icons.Delete />
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
          <label className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors cursor-pointer">
            <Icons.Image />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              className="hidden"
            />
          </label>
          
          {image && (
            <>
              <label className="flex items-center gap-1 cursor-pointer" title="Toggle Image">
                <input
                  type="checkbox"
                  checked={opacity > 0}
                  onChange={(e) => onImageToggle(e.target.checked)}
                  className="h-3 w-3 rounded border-gray-300 text-blue-600"
                />
                <Icons.Eye />
              </label>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="w-16 h-2 accent-blue-600"
                title="Adjust Opacity"
              />
              <span className="text-gray-600 w-6">
                {Math.round(opacity * 100)}%
              </span>
            </>
          )}
        </div>

        {/* Add clear data button */}
        <div className="h-4 w-px bg-gray-200"></div>
        <button
          onClick={onClearData}
          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
          title="Clear All Data"
        >
          <Icons.Delete />
        </button>
      </div>
    </div>
  );
};

export default Controls;
