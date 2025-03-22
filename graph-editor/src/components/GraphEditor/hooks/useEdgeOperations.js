import { useCallback } from 'react';

export const useEdgeOperations = (edges, nodes, setEdges, saveToHistory, onEdgeCreate) => {
  const handleEdgeCreate = useCallback((fromNode, toNode) => {
    // Create a unique edge ID
    const edgeId = `${fromNode.id}-${toNode.id}`;
    
    // Check if edge already exists
    const edgeExists = edges.some(e => 
      (e.from === fromNode.id && e.to === toNode.id) ||
      (e.from === toNode.id && e.to === fromNode.id)
    );

    if (!edgeExists) {
      const newEdge = {
        id: edgeId,
        from: fromNode.id,
        to: toNode.id
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      saveToHistory({ nodes, edges: updatedEdges });
      onEdgeCreate?.(fromNode, toNode);
    }
  }, [edges, nodes, setEdges, saveToHistory, onEdgeCreate]);

  return {
    handleEdgeCreate
  };
}; 