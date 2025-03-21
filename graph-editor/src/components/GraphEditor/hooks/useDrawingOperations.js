import { useCallback } from 'react';

export const useDrawingOperations = ({
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
  }, [gridSize, showGrid, canvasRef, gridPatternRef]);

  const drawGrid = useCallback((ctx) => {
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
      (canvasRef.current.width / zoom) + (2 * gridSize),
      (canvasRef.current.height / zoom) + (2 * gridSize)
    );
    ctx.restore();
  }, [showGrid, gridPatternRef, zoom, offset, gridSize, canvasRef]);

  const drawNode = useCallback((ctx, node, isSelected) => {
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
  }, [nodeSize, highlightedNode, highlightOpacity]);

  const drawEdge = useCallback((ctx, fromNode, toNode, edge) => {
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
  }, [selectedEdge]);

  const drawTempEdge = useCallback((ctx, fromNode, toPos) => {
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.strokeStyle = fromNode.type === 'roomNode' ? '#fda4af' : '#60a5fa';  // Light pinkish red/blue based on node type
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  const drawDistance = useCallback((ctx, fromNode, toNode) => {
    const distance = calculateEdgeDistance(fromNode, toNode);
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    ctx.fillStyle = '#666';
    ctx.font = '7px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(distance), midX, midY - 3);
  }, [calculateEdgeDistance]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
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
  }, [
    canvasRef,
    drawGrid,
    imageRef,
    nodes,
    edges,
    selectedNode,
    isDrawing,
    drawingFrom,
    mousePos,
    showDistances,
    imageOpacity,
    zoom,
    offset,
    drawEdge,
    drawDistance,
    drawTempEdge,
    drawNode
  ]);

  return {
    drawGrid,
    drawNode,
    drawEdge,
    drawTempEdge,
    drawDistance,
    redrawCanvas,
    createGridPattern
  };
}; 