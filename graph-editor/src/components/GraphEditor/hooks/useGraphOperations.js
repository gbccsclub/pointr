import { useCallback, useRef } from 'react';

export const useGraphOperations = () => {
  const nodeIdCounter = useRef(0);

  const createNode = useCallback((x, y) => {
    const id = nodeIdCounter.current++;
    return {
      id: `node-${id}`,
      x: x,
      y: y,
      label: `Node ${id}`
    };
  }, []);

  const snapToGridHelper = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const calculateEdgeDistance = useCallback((fromNode, toNode) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  return {
    createNode,
    snapToGridHelper,
    calculateEdgeDistance
  };
};
