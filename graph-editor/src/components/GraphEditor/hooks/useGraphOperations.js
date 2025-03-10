import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useGraphOperations = (initialNodeCounter = 0, onNodeCounterChange) => {
  const nodeIdCounter = useRef(initialNodeCounter);

  const calculateEdgeDistance = useCallback((fromNode, toNode) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const snapToGridHelper = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const createPathNode = useCallback((x, y) => {
    const id = nodeIdCounter.current++;
    if (onNodeCounterChange) {
      onNodeCounterChange(nodeIdCounter.current);
    }
    return {
      id: `node-${id}`,
      type: 'pathNode',
      x: x,
      y: y,
      label: `${id}`
    };
  }, [onNodeCounterChange]);

  const createRoomNode = useCallback((x, y) => {
    const uuid = uuidv4();
    return {
      id: `room-${uuid}`,
      type: 'roomNode',
      x: x,
      y: y,
      label: `R${uuid.slice(0, 4)}`
    };
  }, []);

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
    createPathNode,
    createRoomNode,
    setNodeCounter,
    getCurrentNodeCounter,
    snapToGridHelper,
    calculateEdgeDistance
  };
};
