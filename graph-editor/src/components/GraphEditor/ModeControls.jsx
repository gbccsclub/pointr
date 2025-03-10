import React from 'react';

const Icons = {
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
};

const ModeControls = ({ editorMode, onModeChange }) => {
  const buttonClass = (mode) => `
    p-1.5 rounded transition-colors
    ${editorMode === mode 
      ? 'bg-blue-600 text-white ring-1 ring-blue-300 shadow-sm' 
      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
  `;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5 flex flex-col gap-1.5">
      <button
        onClick={() => onModeChange('pathNode')}
        disabled={editorMode === 'pathNode'}
        className={buttonClass('pathNode')}
        title="Create Path Node"
      >
        <Icons.Create />
      </button>

      <button
        onClick={() => onModeChange('roomNode')}
        disabled={editorMode === 'roomNode'}
        className={buttonClass('roomNode')}
        title="Create Room Node"
      >
        <Icons.Room />
      </button>

      <button
        onClick={() => onModeChange('edge')}
        disabled={editorMode === 'edge'}
        className={buttonClass('edge')}
        title="Connect Nodes"
      >
        <Icons.Connect />
      </button>
    </div>
  );
};

export default ModeControls;
