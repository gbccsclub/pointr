import { useCallback, useRef } from 'react';

export const useGraphOperations = (initialNodeCounter = 0) => {
  const nodeIdCounter = useRef(initialNodeCounter);

  const createNode = useCallback((x, y) => {
    const id = nodeIdCounter.current++;
    return {
      id: `node-${id}`,
      x: x,
      y: y,
      label: `${id}`
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

  const getCurrentNodeCounter = useCallback(() => {
    return nodeIdCounter.current;
  }, []);

  return {
    createNode,
    snapToGridHelper,
    calculateEdgeDistance,
    getCurrentNodeCounter
  };
};
