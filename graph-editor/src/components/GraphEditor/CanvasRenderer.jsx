import React, { useEffect } from 'react';
import { useDrawingOperations } from './hooks/useDrawingOperations';

const CanvasRenderer = ({
  canvasRef,
  gridPatternRef,
  imageRef,
  nodes,
  edges,
  selectedNode,
  isDrawing,
  drawingFrom,
  mousePos,
  showGrid,
  showDistances,
  imageOpacity,
  zoom,
  offset,
  gridSize,
  nodeSize,
  selectedEdge,
  highlightedNode,
  highlightOpacity,
  calculateEdgeDistance
}) => {
  const {
    drawGrid,
    drawNode,
    drawEdge,
    drawTempEdge,
    drawDistance,
    redrawCanvas,
    createGridPattern
  } = useDrawingOperations({
    canvasRef,
    gridPatternRef,
    imageRef,
    nodes,
    edges,
    selectedNode,
    isDrawing,
    drawingFrom,
    mousePos,
    showGrid,
    showDistances,
    imageOpacity,
    zoom,
    offset,
    gridSize,
    nodeSize,
    selectedEdge,
    highlightedNode,
    highlightOpacity,
    calculateEdgeDistance
  });

  // Handle grid pattern creation
  useEffect(() => {
    createGridPattern();
  }, [gridSize, zoom, showGrid, createGridPattern]);

  // Handle canvas redraw
  useEffect(() => {
    redrawCanvas();
  }, [
    nodes, 
    edges, 
    selectedNode, 
    isDrawing, 
    drawingFrom, 
    mousePos, 
    showGrid, 
    showDistances, 
    imageOpacity,
    zoom,
    offset
  ]);

  return null; // This is a logical component, it doesn't render anything directly
};

export default CanvasRenderer; 