// Export the STORAGE_KEYS constant
export const STORAGE_KEYS = {
  WORKSPACES: 'graph-editor-workspaces',
  CURRENT_WORKSPACE: 'graph-editor-current-workspace'
};

const getWorkspaceKey = (workspaceId) => `graph-editor-workspace-${workspaceId}`;

export const saveWorkspaceList = (workspaces) => {
  localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
};

export const loadWorkspaceList = () => {
  const workspaces = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
  return workspaces ? JSON.parse(workspaces) : [];
};

export const saveCurrentWorkspace = (workspaceId) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_WORKSPACE, workspaceId);
};

export const saveToWorkspace = (workspaceId, nodes, edges, overlayImage, imageOpacity, nodeCounter) => {
  const workspaceKey = getWorkspaceKey(workspaceId);
  const workspaceData = {
    nodes,
    edges,
    imageOpacity,
    nodeCounter: Number(nodeCounter), // Ensure it's saved as a number
    overlayImage,
    lastModified: Date.now()
  };
  
  localStorage.setItem(workspaceKey, JSON.stringify(workspaceData));
};

export const loadFromWorkspace = (workspaceId) => {
  try {
    const workspaceKey = getWorkspaceKey(workspaceId);
    const workspaceData = localStorage.getItem(workspaceKey);
    
    if (!workspaceData) {
      return {
        nodes: [],
        edges: [],
        overlayImage: null,
        imageOpacity: 0.5,
        nodeCounter: 0
      };
    }

    const data = JSON.parse(workspaceData);
    
    // Calculate the next available node counter if not present
    let nodeCounter;
    if (typeof data.nodeCounter === 'number' && !isNaN(data.nodeCounter)) {
      nodeCounter = data.nodeCounter;
    } else {
      nodeCounter = Math.max(
        ...(data.nodes || [])
          .filter(n => n.type === 'pathNode')
          .map(n => parseInt(n.id, 10))
          .filter(id => !isNaN(id)),
        -1
      ) + 1;
    }

    return {
      nodes: data.nodes || [],
      edges: data.edges || [],
      overlayImage: data.overlayImage,
      imageOpacity: data.imageOpacity ?? 0.5,
      nodeCounter: nodeCounter
    };
  } catch (error) {
    console.error('Error loading workspace:', error);
    return {
      nodes: [],
      edges: [],
      overlayImage: null,
      imageOpacity: 0.5,
      nodeCounter: 0
    };
  }
};
