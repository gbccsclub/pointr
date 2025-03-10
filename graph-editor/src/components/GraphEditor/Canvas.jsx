import React, { useRef, useEffect, useState } from 'react';
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
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Add new state for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const { createNode, snapToGridHelper, calculateEdgeDistance } = useGraphOperations();

  useEffect(() => {
    if (overlayImage) {
      const img = new Image();
      img.src = overlayImage;
      img.onload = () => {
        imageRef.current = img;
        redrawCanvas();
      };
    } else {
      imageRef.current = null;
      redrawCanvas();
    }
  }, [overlayImage]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw background image if exists
    if (imageRef.current) {
      ctx.globalAlpha = imageOpacity;
      const img = imageRef.current;
      const scale = Math.min(
        canvasSize.width / img.width,
        canvasSize.height / img.height
      );
      const x = (canvasSize.width - img.width * scale) / 2;
      const y = (canvasSize.height - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.globalAlpha = 1;
    }
    
    // Draw grid
    if (showGrid) {
      drawGrid(ctx);
    }
    
    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        drawEdge(ctx, fromNode, toNode);
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
  };

  useEffect(() => {
    redrawCanvas();
  }, [nodes, edges, selectedNode, isDrawing, drawingFrom, mousePos, showGrid, showDistances, imageOpacity]);

  const drawGrid = (ctx) => {
    ctx.fillStyle = 'var(--grid)';
    
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      for (let y = 0; y <= canvasSize.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const drawNode = (ctx, node, isSelected) => {
    // Reduce radius from 10 to 6
    const radius = 6;
    
    // Use explicit colors instead of CSS variables
    const primaryBlue = '#2563eb';     // Default node color
    const selectBlue = '#60a5fa';      // Light blue for selection
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    
    // Use primary blue for fill and add subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = primaryBlue;
    ctx.fill();
    
    // Draw border with selection indicator
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = isSelected ? selectBlue : primaryBlue;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw label with slight offset for better readability
    ctx.fillStyle = '#1e293b'; // Text color
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, node.y + 18);
  };

  const drawEdge = (ctx, fromNode, toNode) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = '#93c5fd';  // Changed to light blue
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawTempEdge = (ctx, fromNode, toPos) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.strokeStyle = '#60a5fa';  // Light blue for temp edge
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
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(distance), midX, midY - 5);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (snapToGrid) {
      x = snapToGridHelper(x, gridSize);
      y = snapToGridHelper(y, gridSize);
    }

    const clickedNode = nodes.find(node => 
      Math.hypot(node.x - x, node.y - y) < 15
    );

    if (clickedNode) {
      if (editorMode === 'edge' && isDrawing && drawingFrom) {
        if (clickedNode.id !== drawingFrom.id) {
          onEdgeCreate(drawingFrom, clickedNode);
        }
        setIsDrawing(false);
        setDrawingFrom(null);
      } else if (editorMode === 'node') {
        setSelectedNode(clickedNode);
        setIsDragging(true);
        setDraggedNode(clickedNode);
      } else {
        setSelectedNode(clickedNode);
        if (editorMode === 'edge') {
          setIsDrawing(true);
          setDrawingFrom(clickedNode);
        }
      }
    } else if (editorMode === 'node') {
      const newNode = createNode(x, y);
      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setSelectedNode(newNode);
      saveToHistory({ nodes: updatedNodes, edges });
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (snapToGrid) {
      x = snapToGridHelper(x, gridSize);
      y = snapToGridHelper(y, gridSize);
    }
    
    setMousePos({ x, y });

    if (isDragging && draggedNode && editorMode === 'node') {
      const updatedNodes = nodes.map(node => 
        node.id === draggedNode.id 
          ? { ...node, x, y }
          : node
      );
      setNodes(updatedNodes);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && draggedNode) {
      saveToHistory({ nodes, edges });
      setIsDragging(false);
      setDraggedNode(null);
    }
  };

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
    />
  );
};

export default Canvas;
