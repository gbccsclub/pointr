import React from 'react';
import Neo4jControls from './Neo4jControls';

// SVG Icons as components for better reusability
const Icons = {
  Undo: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  Create: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Connect: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <g transform="rotate(45, 12, 12)">
        <circle cx="6" cy="12" r="3" strokeWidth={2} />
        <circle cx="18" cy="12" r="3" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
      </g>
    </svg>
  ),
  Room: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
  EyeClosed: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
            <button
              onClick={() => onImageToggle(!opacity)}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Toggle Image Visibility"
            >
              {opacity > 0 ? <Icons.Eye /> : <Icons.EyeClosed />}
            </button>
          )}
        </div>
        
        {/* Remove clear data button and its divider */}
      </div>
    </div>
  );
};

export default Controls;
