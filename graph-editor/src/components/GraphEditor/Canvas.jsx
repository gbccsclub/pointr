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
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
    ctx.strokeStyle = 'var(--grid)';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  };

  const drawNode = (ctx, node, isSelected) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? 'var(--node-selected)' : 'var(--node)';
    ctx.fill();
    ctx.strokeStyle = isSelected ? 'var(--node-selected)' : 'var(--node)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw label
    ctx.fillStyle = 'var(--text)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, node.y + 25);
  };

  const drawEdge = (ctx, fromNode, toNode) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = 'var(--edge)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawTempEdge = (ctx, fromNode, toPos) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.strokeStyle = '#999';
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
      if (isDrawing) {
        onEdgeCreate(drawingFrom, clickedNode);
      } else {
        setSelectedNode(clickedNode);
        setIsDrawing(true);
        setDrawingFrom(clickedNode);
      }
    } else {
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
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="absolute inset-0"
    />
  );
};

export default Canvas;
