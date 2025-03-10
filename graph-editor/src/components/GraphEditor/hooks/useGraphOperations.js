import { useCallback, useRef } from 'react';

export const useGraphOperations = (initialNodeCounter = 0, initialRoomCounter = 0, onNodeCounterChange, onRoomCounterChange) => {
  const nodeIdCounter = useRef(Number(initialNodeCounter));
  const roomIdCounter = useRef(Number(initialRoomCounter));

  const calculateEdgeDistance = useCallback((fromNode, toNode) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const snapToGridHelper = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const createPathNode = useCallback((x, y) => {
    const id = Number(nodeIdCounter.current);
    if (isNaN(id)) {
      console.error('Invalid node counter:', nodeIdCounter.current);
      nodeIdCounter.current = 0;
    }
    
    const node = {
      id: `n${nodeIdCounter.current}`, // Prefix with 'n' for path nodes
      type: 'pathNode',
      x: x,
      y: y,
      label: String(nodeIdCounter.current)
    };
    
    nodeIdCounter.current = id + 1;
    
    if (onNodeCounterChange) {
      onNodeCounterChange(nodeIdCounter.current);
    }
    
    return node;
  }, [onNodeCounterChange]);

  const createRoomNode = useCallback((x, y) => {
    const id = Number(roomIdCounter.current);
    if (isNaN(id)) {
      console.error('Invalid room counter:', roomIdCounter.current);
      roomIdCounter.current = 0;
    }

    const node = {
      id: `r${roomIdCounter.current}`, // Prefix with 'r' for room nodes
      type: 'roomNode',
      x: x,
      y: y,
      label: `R${roomIdCounter.current}`
    };
    
    roomIdCounter.current = id + 1;
    
    if (onRoomCounterChange) {
      onRoomCounterChange(roomIdCounter.current);
    }
    
    return node;
  }, [onRoomCounterChange]);

  const setNodeCounter = useCallback((value) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      nodeIdCounter.current = numValue;
      if (onNodeCounterChange) {
        onNodeCounterChange(numValue);
      }
    }
  }, [onNodeCounterChange]);

  const setRoomCounter = useCallback((value) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      roomIdCounter.current = numValue;
      if (onRoomCounterChange) {
        onRoomCounterChange(numValue);
      }
    }
  }, [onRoomCounterChange]);

  const getCurrentNodeCounter = useCallback(() => {
    return nodeIdCounter.current;
  }, []);

  const getCurrentRoomCounter = useCallback(() => {
    return roomIdCounter.current;
  }, []);

  return {
    createPathNode,
    createRoomNode,
    setNodeCounter,
    setRoomCounter,
    getCurrentNodeCounter,
    getCurrentRoomCounter,
    snapToGridHelper,
    calculateEdgeDistance
  };
};
