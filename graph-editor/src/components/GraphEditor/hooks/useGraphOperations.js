import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useGraphOperations = (initialNodeCounter = 0, onNodeCounterChange) => {
  const nodeIdCounter = useRef(Number(initialNodeCounter));

  const calculateEdgeDistance = useCallback((fromNode, toNode) => {
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const snapToGridHelper = useCallback((value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  }, []);

  const createPathNode = useCallback((x, y) => {
    // Ensure we have a valid number
    const id = Number(nodeIdCounter.current);
    if (isNaN(id)) {
      console.error('Invalid node counter:', nodeIdCounter.current);
      nodeIdCounter.current = 0;
    }
    
    // Create node with current counter value
    const node = {
      id: String(nodeIdCounter.current), // Convert to string to maintain consistency
      type: 'pathNode',
      x: x,
      y: y,
      label: String(nodeIdCounter.current)
    };
    
    // Increment counter after node creation
    nodeIdCounter.current = id + 1;
    
    if (onNodeCounterChange) {
      onNodeCounterChange(nodeIdCounter.current);
    }
    
    return node;
  }, [onNodeCounterChange]);

  const createRoomNode = useCallback((x, y) => {
    // Generate a 5-digit random number
    const randomId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return {
      id: randomId,
      type: 'roomNode',
      x: x,
      y: y,
      label: `R${randomId}`
    };
  }, []);

  const setNodeCounter = useCallback((value) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      nodeIdCounter.current = numValue;
      if (onNodeCounterChange) {
        onNodeCounterChange(numValue);
      }
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
