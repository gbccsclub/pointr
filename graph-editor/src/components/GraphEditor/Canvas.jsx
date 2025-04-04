import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGraphOperations } from './hooks/useGraphOperations';

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
  const gridCanvasRef = useRef(null);
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

  // Initialize counters
  useEffect(() => {
    setNodeCounter(initialNodeCounter);
    setRoomCounter(initialRoomCounter);
  }, [initialNodeCounter, initialRoomCounter, setNodeCounter, setRoomCounter]);

  // Handle edge creation
  const handleEdgeCreate = useCallback((fromNode, toNode) => {
    // Create a unique edge ID
    const edgeId = `${fromNode.id}-${toNode.id}`;
    
    // Check if edge already exists
    const edgeExists = edges.some(e => 
      (e.from === fromNode.id && e.to === toNode.id) ||
      (e.from === toNode.id && e.to === fromNode.id)
    );

    if (!edgeExists) {
      const newEdge = {
        id: edgeId,
        from: fromNode.id,
        to: toNode.id
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      saveToHistory({ nodes, edges: updatedEdges });
      onEdgeCreate?.(fromNode, toNode);
    }
  }, [edges, nodes, setEdges, saveToHistory, onEdgeCreate]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = (screenX, screenY) => {
    return {
      x: (screenX - offset.x) / zoom,
      y: (screenY - offset.y) / zoom
    };
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (canvasX, canvasY) => {
    return {
      x: canvasX * zoom + offset.x,
      y: canvasY * zoom + offset.y
    };
  };

  useEffect(() => {
    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        imageRef.current = img;
        redrawCanvas();
      };
      img.onerror = () => {
        console.error('Failed to load overlay image');
        imageRef.current = null;
        redrawCanvas();
      };
    } else {
      imageRef.current = null;
      redrawCanvas();
    }
  }, [overlayImage]);

  const createGridPattern = useCallback(() => {
    if (!showGrid) return;

    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = gridSize;
    patternCanvas.height = gridSize;
    const patternCtx = patternCanvas.getContext('2d');

    // Create dot without zoom factor since we're scaling in drawGrid
    const dotSize = 1;

    patternCtx.fillStyle = 'var(--grid)';
    patternCtx.beginPath();
    patternCtx.arc(0, 0, dotSize, 0, 2 * Math.PI);
    patternCtx.fill();

    const pattern = canvasRef.current?.getContext('2d').createPattern(patternCanvas, 'repeat');
    gridPatternRef.current = pattern;
  }, [gridSize, showGrid]); // Removed zoom dependency since we handle it in drawGrid

  useEffect(() => {
    createGridPattern();
  }, [gridSize, zoom, showGrid, createGridPattern]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw grid in screen space
    drawGrid(ctx);
    
    // Apply transform for other elements
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    
    // Draw background image if exists
    if (imageRef.current) {
      const img = imageRef.current;
      ctx.globalAlpha = imageOpacity;
      
      // Calculate the base scale to fit the image within the canvas
      const scaleX = canvasSize.width / img.width;
      const scaleY = canvasSize.height / img.height;
      const baseScale = Math.min(scaleX, scaleY);
      
      // Calculate image dimensions
      const scaledWidth = img.width * baseScale;
      const scaledHeight = img.height * baseScale;
      
      // Position image at center
      const x = -scaledWidth / 2;
      const y = -scaledHeight / 2;
      
      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      ctx.globalAlpha = 1;
    }
    
    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        drawEdge(ctx, fromNode, toNode, edge);
        if (showDistances) {
          drawDistance(ctx, fromNode, toNode);
        }
      }
    });
    
    // Draw temporary edge while drawing
    if (isDrawing && drawingFrom) {
      drawTempEdge(ctx, drawingFrom, mousePos);
    }
    
    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node, node.id === selectedNode?.id);
    });

    ctx.restore();
  };

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

  const drawGrid = (ctx) => {
    if (!showGrid || !gridPatternRef.current) return;
    
    const pattern = gridPatternRef.current;
    
    // Calculate pattern offset in screen space, accounting for zoom properly
    const patternOffset = {
      x: (offset.x / zoom) % gridSize,
      y: (offset.y / zoom) % gridSize
    };
    
    ctx.save();
    ctx.resetTransform(); // Reset the transform to draw grid in screen space
    ctx.scale(zoom, zoom); // Apply zoom to make grid cells scale properly
    ctx.fillStyle = pattern;
    ctx.translate(patternOffset.x, patternOffset.y);
    ctx.fillRect(
      -patternOffset.x - gridSize,
      -patternOffset.y - gridSize,
      (canvasSize.width / zoom) + (2 * gridSize),
      (canvasSize.height / zoom) + (2 * gridSize)
    );
    ctx.restore();
  };

  const drawNode = (ctx, node, isSelected) => {
    const radius = nodeSize;
    
    const colors = {
      pathNode: {
        fill: '#2563eb',
        selected: '#60a5fa'
      },
      roomNode: {
        fill: '#f43f5e',
        selected: '#fb7185'
      }
    };
    
    const nodeColors = colors[node.type];
    
    // Draw highlight for searched node
    if (highlightedNode && 
        node.x === highlightedNode.x && 
        node.y === highlightedNode.y && 
        highlightOpacity > 0) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(0, 255, 0, ${highlightOpacity})`; // Pure #00FF00 green
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = `rgba(0, 200, 0, ${highlightOpacity})`; // Slightly darker green for glow
      ctx.shadowBlur = 10;
      
      // Request next frame for animation
      requestAnimationFrame(redrawCanvas);
    }
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    
    // Use node type specific colors and add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = nodeColors.fill;
    ctx.fill();
    
    // Draw border with selection indicator
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? nodeColors.selected : nodeColors.fill;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw label with slight offset for better readability
    ctx.fillStyle = '#1e293b';
    ctx.font = '7px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, node.y + (radius + 8));
  };

  const drawEdge = (ctx, fromNode, toNode, edge) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    
    // Determine edge color based on connected nodes
    const isRoomConnection = fromNode.type === 'roomNode' || toNode.type === 'roomNode';
    
    // Highlight selected edge or use appropriate color based on connection type
    if (selectedEdge && edge.id === selectedEdge.id) {
      ctx.strokeStyle = isRoomConnection ? '#fb7185' : '#60a5fa';  // Light pinkish red/blue for selected edge
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = isRoomConnection ? '#fda4af' : '#93c5fd';  // Lighter pinkish red/blue for normal edge
      ctx.lineWidth = 2;
    }
    
    ctx.stroke();
  };

  const drawTempEdge = (ctx, fromNode, toPos) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.strokeStyle = fromNode.type === 'roomNode' ? '#fda4af' : '#60a5fa';  // Light pinkish red/blue based on node type
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawDistance = (ctx, fromNode, toNode) => {
    const distance = calculateEdgeDistance(fromNode, toNode);
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    ctx.fillStyle = '#666';
    ctx.font = '7px Arial'; // Reduced from 9px to 7px
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(distance), midX, midY - 3); // Reduced offset from 4 to 3
  };

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
