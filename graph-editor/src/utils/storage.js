const STORAGE_KEYS = {
  GRAPH_DATA: 'graph-editor-data',
  OVERLAY_IMAGE: 'graph-editor-overlay',
  NODE_COUNTER: 'graph-editor-node-counter'
};

export const saveToLocalStorage = (nodes, edges, overlayImage, imageOpacity, nodeCounter) => {
  try {
    // Save graph data
    const graphData = {
      nodes,
      edges,
      imageOpacity
    };
    localStorage.setItem(STORAGE_KEYS.GRAPH_DATA, JSON.stringify(graphData));

    // Save overlay image separately (if exists)
    if (overlayImage) {
      localStorage.setItem(STORAGE_KEYS.OVERLAY_IMAGE, overlayImage);
    } else {
      localStorage.removeItem(STORAGE_KEYS.OVERLAY_IMAGE);
    }

    // Save node counter
    localStorage.setItem(STORAGE_KEYS.NODE_COUNTER, nodeCounter.toString());
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = () => {
  try {
    // Load graph data
    const graphDataString = localStorage.getItem(STORAGE_KEYS.GRAPH_DATA);
    const graphData = graphDataString ? JSON.parse(graphDataString) : null;

    // Load overlay image
    const overlayImage = localStorage.getItem(STORAGE_KEYS.OVERLAY_IMAGE);

    // Load node counter
    const nodeCounter = parseInt(localStorage.getItem(STORAGE_KEYS.NODE_COUNTER)) || 0;

    return {
      nodes: graphData?.nodes || [],
      edges: graphData?.edges || [],
      overlayImage,
      imageOpacity: graphData?.imageOpacity ?? 0.5,
      nodeCounter
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return {
      nodes: [],
      edges: [],
      overlayImage: null,
      imageOpacity: 0.5,
      nodeCounter: 0
    };
  }
};
