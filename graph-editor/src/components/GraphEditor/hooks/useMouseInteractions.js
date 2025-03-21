import { useCallback } from 'react';

export const useMouseInteractions = ({
  canvasRef,
  nodes,
  edges,
  editorMode,
  isDrawing,
  drawingFrom,
  isDragging,
  draggedNode,
  isPanning,
  lastPanPoint,
  zoom,
  offset,
  snapToGrid,
  gridSize,
  snapToGridHelper,
  screenToCanvas,
  setMousePos,
  setIsDragging,
  setDraggedNode,
  setIsPanning,
  setLastPanPoint,
  setSelectedNode,
  setSelectedEdge,
  setIsDrawing,
  setDrawingFrom,
  setNodes,
  setOffset,
  handleEdgeCreate,
  saveToHistory
}) => {
  const isPointOnEdge = useCallback((point, edge) => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return false;

    // Convert line segment to vector
    const lineVector = {
      x: toNode.x - fromNode.x,
      y: toNode.y - fromNode.y
    };

    // Vector from start point to click point
    const pointVector = {
      x: point.x - fromNode.x,
      y: point.y - fromNode.y
    };

    // Calculate dot products
    const lineLengthSquared = lineVector.x * lineVector.x + lineVector.y * lineVector.y;
    const t = Math.max(0, Math.min(1, (pointVector.x * lineVector.x + pointVector.y * lineVector.y) / lineLengthSquared));

    // Calculate nearest point on line
    const nearestPoint = {
      x: fromNode.x + t * lineVector.x,
      y: fromNode.y + t * lineVector.y
    };

    // Calculate distance from click to nearest point
    const distance = Math.hypot(point.x - nearestPoint.x, point.y - nearestPoint.y);
    
    // Consider the click "on the edge" if within 5 pixels
    return distance <= 5;
  }, [nodes]);

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (e.button === 1 || (e.button === 0 && e.getModifierState('Space'))) {
      setIsPanning(true);
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    const { x, y } = screenToCanvas(screenX, screenY);
    const snappedX = snapToGrid ? snapToGridHelper(x, gridSize) : x;
    const snappedY = snapToGrid ? snapToGridHelper(y, gridSize) : y;
    const clickPoint = { x: snappedX, y: snappedY };

    // Check for node clicks first
    const clickedNode = nodes.find(node => 
      Math.hypot(node.x - snappedX, node.y - snappedY) <= 10 / zoom
    );

    if (clickedNode) {
      if (editorMode === 'edge' && isDrawing && drawingFrom) {
        if (clickedNode.id !== drawingFrom.id) {
          handleEdgeCreate(drawingFrom, clickedNode);
        }
        setIsDrawing(false);
        setDrawingFrom(null);
      } else if (editorMode === 'select') {
        setSelectedNode(clickedNode);
        setIsDragging(true);
        setDraggedNode(clickedNode);
      } else if (editorMode === 'edge') {
        setIsDrawing(true);
        setDrawingFrom(clickedNode);
      }
      setSelectedEdge(null);
      return;
    }

    // Check for edge clicks only in select mode
    if (editorMode === 'select') {
      const clickedEdge = edges.find(edge => isPointOnEdge(clickPoint, edge));
      if (clickedEdge) {
        setSelectedEdge(clickedEdge);
        setSelectedNode(null);
        return;
      }
    }

    // Clear selections in select mode when clicking empty space
    if (editorMode === 'select') {
      setSelectedNode(null);
      setSelectedEdge(null);
      return;
    }
  }, [
    canvasRef,
    editorMode,
    isDrawing,
    drawingFrom,
    nodes,
    edges,
    zoom,
    snapToGrid,
    gridSize,
    snapToGridHelper,
    screenToCanvas,
    setIsDrawing,
    setDrawingFrom,
    setSelectedNode,
    setSelectedEdge,
    setIsDragging,
    setDraggedNode,
    setIsPanning,
    setLastPanPoint,
    handleEdgeCreate,
    isPointOnEdge
  ]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isPanning && lastPanPoint) {
      const dx = screenX - lastPanPoint.x;
      const dy = screenY - lastPanPoint.y;
      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
      setLastPanPoint({ x: screenX, y: screenY });
      return;
    }

    // Convert screen coordinates to canvas coordinates
    const { x, y } = screenToCanvas(screenX, screenY);
    const snappedX = snapToGrid ? snapToGridHelper(x, gridSize) : x;
    const snappedY = snapToGrid ? snapToGridHelper(y, gridSize) : y;
    
    setMousePos({ x: snappedX, y: snappedY });

    // Only allow node dragging in select mode
    if (isDragging && draggedNode && editorMode === 'select') {
      const updatedNodes = nodes.map(node => 
        node.id === draggedNode.id 
          ? { ...node, x: snappedX, y: snappedY }
          : node
      );
      setNodes(updatedNodes);
    }
  }, [
    canvasRef,
    isPanning,
    lastPanPoint,
    offset,
    snapToGrid,
    gridSize,
    snapToGridHelper,
    screenToCanvas,
    setMousePos,
    setOffset,
    setLastPanPoint,
    isDragging,
    draggedNode,
    editorMode,
    nodes,
    setNodes
  ]);

  const handleMouseUp = useCallback((e) => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    if (isDragging && draggedNode && editorMode === 'select') {
      // Save the final position to history
      saveToHistory({ nodes, edges });
    }

    setIsDragging(false);
    setDraggedNode(null);
  }, [
    isPanning,
    isDragging,
    draggedNode,
    editorMode,
    nodes,
    edges,
    setIsPanning,
    setLastPanPoint,
    setIsDragging,
    setDraggedNode,
    saveToHistory
  ]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}; 