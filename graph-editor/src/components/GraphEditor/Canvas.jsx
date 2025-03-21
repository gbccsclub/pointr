import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGraphOperations } from './hooks/useGraphOperations';
import { useCoordinateConversion } from './hooks/useCoordinateConversion';
import { useEdgeOperations } from './hooks/useEdgeOperations';
import { useDrawingOperations } from './hooks/useDrawingOperations';

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
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [highlightOpacity, setHighlightOpacity] = useState(1);

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

  // Get drawing operations
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

  // Initialize counters
  useEffect(() => {
    setNodeCounter(initialNodeCounter);
    setRoomCounter(initialRoomCounter);
  }, [initialNodeCounter, initialRoomCounter, setNodeCounter, setRoomCounter]);

  useEffect(() => {
    createGridPattern();
  }, [gridSize, zoom, showGrid, createGridPattern]);

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

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5);

    // Adjust offset to zoom toward mouse position
    const newOffset = {
      x: mouseX - (mouseX - offset.x) * (newZoom / zoom),
      y: mouseY - (mouseY - offset.y) * (newZoom / zoom)
    };

    setZoom(newZoom);
    setOffset(newOffset);
    // Immediately redraw after zoom changes
    requestAnimationFrame(redrawCanvas);
  };

  const isPointOnEdge = (point, edge) => {
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
  };

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

    // Create new node based on mode
    if (editorMode === 'pathNode' || editorMode === 'roomNode') {
      const newNode = editorMode === 'pathNode' 
        ? createPathNode(snappedX, snappedY)
        : createRoomNode(snappedX, snappedY);
      
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      saveToHistory({ nodes: updatedNodes, edges });
      
      if (editorMode === 'pathNode') {
        onNodeCounterChange(getCurrentNodeCounter());
      }
    }
  }, [
    editorMode,
    isDrawing,
    drawingFrom,
    nodes,
    zoom,
    snapToGrid,
    gridSize,
    handleEdgeCreate,
    setIsDrawing,
    setDrawingFrom,
    setSelectedNode,
    setSelectedEdge
  ]);

  const handleMouseMove = (e) => {
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
      requestAnimationFrame(redrawCanvas);
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
      requestAnimationFrame(redrawCanvas);
    }

    // Handle edge drawing preview
    if (isDrawing && drawingFrom) {
      requestAnimationFrame(redrawCanvas);
    }
  };

  const handleMouseUp = (e) => {
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

    if (isDrawing && !draggedNode) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { x, y } = screenToCanvas(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  };

  // Add this effect to handle initial image centering
  useEffect(() => {
    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        // Center the canvas view when a new image is loaded
        const scaleX = canvasSize.width / img.width;
        const scaleY = canvasSize.height / img.height;
        const baseScale = Math.min(scaleX, scaleY);
        
        setZoom(1);
        setOffset({
          x: canvasSize.width / 2,
          y: canvasSize.height / 2
        });
        
        imageRef.current = img;
        redrawCanvas();
      };
    } else {
      imageRef.current = null;
      redrawCanvas();
    }
  }, [overlayImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5);

      // Adjust offset to zoom toward mouse position
      const newOffset = {
        x: mouseX - (mouseX - offset.x) * (newZoom / zoom),
        y: mouseY - (mouseY - offset.y) * (newZoom / zoom)
      };

      setZoom(newZoom);
      setOffset(newOffset);
      // Immediately redraw after zoom changes
      requestAnimationFrame(redrawCanvas);
    };

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelEvent);
  }, [zoom, offset, redrawCanvas]);

  // Add this effect to handle viewport centering
  const SEARCH_ZOOM_LEVEL = 4; // You can adjust this value to your preferred zoom level

  useEffect(() => {
    if (viewportCenter) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const centerX = canvasRect.width / 2;
      const centerY = canvasRect.height / 2;
      
      // Set new zoom level
      setZoom(SEARCH_ZOOM_LEVEL);
      
      // Calculate new offset to center the node with the new zoom level
      const newOffset = {
        x: centerX - (viewportCenter.x * SEARCH_ZOOM_LEVEL),
        y: centerY - (viewportCenter.y * SEARCH_ZOOM_LEVEL)
      };
      
      setOffset(newOffset);
      
      // Clear the viewport center immediately after applying the transformation
      // This allows the user to freely pan/zoom afterward
      setViewportCenter(null);
      
      // Trigger a redraw
      requestAnimationFrame(redrawCanvas);
    }
  }, [viewportCenter]);

  // Add effect to handle highlight blink and fade
  useEffect(() => {
    if (!highlightedNode) return;
    
    // Blink 3 times before starting fade
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      setHighlightOpacity(prev => prev === 1 ? 0 : 1);
      blinkCount++;
      
      if (blinkCount >= 6) { // 3 full blinks (on-off cycles)
        clearInterval(blinkInterval);
        setHighlightOpacity(1);
        
        // Start fade out after blinking
        const fadeInterval = setInterval(() => {
          setHighlightOpacity(prev => {
            if (prev <= 0) {
              clearInterval(fadeInterval);
              setHighlightedNode(null);
              return 0;
            }
            return prev - 0.05;
          });
        }, 50); // Fade update every 50ms
      }
    }, 200); // Blink every 200ms
    
    // Cleanup intervals
    return () => {
      clearInterval(blinkInterval);
    };
  }, [highlightedNode]);

  return (
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
  );
};

export default Canvas;
