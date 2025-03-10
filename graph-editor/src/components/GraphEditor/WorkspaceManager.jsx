import React, { useState } from 'react';

// SVG Icons as components
const Icons = {
  New: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Delete: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Cancel: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

const WorkspaceManager = ({
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onWorkspaceCreate,
  onWorkspaceDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      onWorkspaceCreate(newWorkspaceName.trim());
      setNewWorkspaceName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 text-xs">
      <div className="flex items-center gap-2">
        <select
          value={currentWorkspace?.id || ''}
          onChange={(e) => onWorkspaceChange(e.target.value)}
          className="px-2 py-1 rounded border border-gray-200"
        >
          {workspaces.map(workspace => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>

        {isCreating ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="px-2 py-1 rounded border border-gray-200"
              placeholder="Workspace name"
            />
            <button
              onClick={handleCreateWorkspace}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="Create Workspace"
            >
              <Icons.Check />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Cancel"
            >
              <Icons.Cancel />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => setIsCreating(true)}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="New Workspace"
            >
              <Icons.New />
            </button>
            {workspaces.length > 1 && currentWorkspace && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this workspace?')) {
                    onWorkspaceDelete(currentWorkspace.id);
                  }
                }}
                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Delete Workspace"
              >
                <Icons.Delete />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceManager;
