import { useCallback, useRef } from 'react';

export const useGraphOperations = (initialNodeCounter = 0, onNodeCounterChange) => {
  const nodeIdCounter = useRef(initialNodeCounter);

  const snapToGridHelper = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const createNode = useCallback((x, y) => {
    const id = nodeIdCounter.current++;
    if (onNodeCounterChange) {
      onNodeCounterChange(nodeIdCounter.current);
    }
    return {
      id: `node-${id}`,
      x: x,
      y: y,
      label: `${id}`
    };
  }, [onNodeCounterChange]);

  const setNodeCounter = useCallback((value) => {
    nodeIdCounter.current = value;
    if (onNodeCounterChange) {
      onNodeCounterChange(value);
    }
  }, [onNodeCounterChange]);

  const getCurrentNodeCounter = useCallback(() => {
    return nodeIdCounter.current;
  }, []);

  return {
    createNode,
    setNodeCounter,
    getCurrentNodeCounter,
    snapToGridHelper
  };
};
