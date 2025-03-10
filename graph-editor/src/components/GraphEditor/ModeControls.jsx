import React from 'react';

const Icons = {
  PathNode: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4m-12 0h-4" />
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
      <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9h16M9 4v16" />
    </svg>
  ),
};

const ModeControls = ({ editorMode, onModeChange }) => {
  const buttonClass = (mode) => 
    editorMode === mode
      ? 'p-1.5 rounded bg-blue-600 text-white ring-1 ring-blue-300 shadow-sm cursor-default pointer-events-none'
      : 'p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors';

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5 flex flex-col gap-1.5">
      <button
        onClick={() => onModeChange('pathNode')}
        disabled={editorMode === 'pathNode'}
        className={buttonClass('pathNode')}
        title="Create Path Node"
      >
        <Icons.PathNode />
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
