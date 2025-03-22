import React, { useEffect } from 'react';
import { useDrawingOperations } from './hooks/useDrawingOperations';

interface CanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gridPatternRef: React.RefObject<CanvasPattern | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  nodes: any[];
  edges: any[];
  selectedNode: any;
  isDrawing: boolean;
  drawingFrom: any;
  mousePos: { x: number; y: number };
  showGrid: boolean;
  showDistances: boolean;
  imageOpacity: number;
  zoom: number;
  offset: { x: number; y: number };
  gridSize: number;
  nodeSize: number;
  selectedEdge: any;
  highlightedNode: any;
  highlightOpacity: number;
  calculateEdgeDistance: (fromNode: any, toNode: any) => number;
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
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
