import React, { useRef, useEffect, useState } from 'react';
import { useGraphOperations } from './hooks/useGraphOperations';
import { useCoordinateConversion } from './hooks/useCoordinateConversion';
import { useEdgeOperations } from './hooks/useEdgeOperations';
import { useMouseInteractions } from './hooks/useMouseInteractions';
import { useZoomAndPan } from './hooks/useZoomAndPan';
import { useHighlight } from './hooks/useHighlight';
import CanvasRenderer from './CanvasRenderer';

const Canvas = ({
  nodes,
  edges,
  selectedNode,
  isDrawing,
  drawingFrom,
  gridSize,
  showGrid,
  showDistances,
  snapToGrid,
  canvasSize,
  setNodes,
  setEdges,
  setSelectedNode,
  setIsDrawing,
  setDrawingFrom,
  saveToHistory,
  onEdgeCreate,
  overlayImage,
  imageOpacity,
  editorMode,
  selectedEdge,
  setSelectedEdge,
  nodeSize,
  onNodeCounterChange,
  onRoomCounterChange,
  initialNodeCounter = 0,
  initialRoomCounter = 0,
  viewportCenter,
  setViewportCenter
}) => {
  // Refs first
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const gridPatternRef = useRef(null);

  // All useState hooks
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Get graph operations
  const { 
    createPathNode, 
    createRoomNode,
    snapToGridHelper, 
    calculateEdgeDistance, 
    getCurrentNodeCounter,
    getCurrentRoomCounter,
    setNodeCounter,
    setRoomCounter
  } = useGraphOperations(
    initialNodeCounter,
    initialRoomCounter,
    onNodeCounterChange,
    onRoomCounterChange
  );

  // Get coordinate conversion operations
  const { screenToCanvas, canvasToScreen } = useCoordinateConversion(zoom, offset);

  // Get edge operations
  const { handleEdgeCreate } = useEdgeOperations(edges, nodes, setEdges, saveToHistory, onEdgeCreate);

  // Get zoom and pan operations
  const { centerImage, isPanning, setIsPanning, lastPanPoint, setLastPanPoint } = useZoomAndPan({
    canvasRef,
    zoom,
    setZoom,
    offset,
    setOffset,
    viewportCenter,
    setViewportCenter,
    canvasSize
  });

  // Get highlight operations
  const { highlightedNode, setHighlightedNode, highlightOpacity } = useHighlight();

  // Initialize counters
  useEffect(() => {
    setNodeCounter(initialNodeCounter);
    setRoomCounter(initialRoomCounter);
  }, [initialNodeCounter, initialRoomCounter, setNodeCounter, setRoomCounter]);

  // Handle image loading and centering
  useEffect(() => {
    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        centerImage(img);
        imageRef.current = img;
      };
    } else {
      imageRef.current = null;
    }
  }, [overlayImage, centerImage]);

  // Get mouse interaction handlers
  const { handleMouseDown, handleMouseMove, handleMouseUp } = useMouseInteractions({
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
  });

  return (
    <>
      <CanvasRenderer
        canvasRef={canvasRef}
        gridPatternRef={gridPatternRef}
        imageRef={imageRef}
        nodes={nodes}
        edges={edges}
        selectedNode={selectedNode}
        isDrawing={isDrawing}
        drawingFrom={drawingFrom}
        mousePos={mousePos}
        showGrid={showGrid}
        showDistances={showDistances}
        imageOpacity={imageOpacity}
        zoom={zoom}
        offset={offset}
        gridSize={gridSize}
        nodeSize={nodeSize}
        selectedEdge={selectedEdge}
        highlightedNode={highlightedNode}
        highlightOpacity={highlightOpacity}
        calculateEdgeDistance={calculateEdgeDistance}
      />
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="absolute inset-0"
        style={{ cursor: isPanning ? 'grab' : 'default' }}
      />
    </>
  );
};

export default Canvas;
