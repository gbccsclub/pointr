import { useEffect, useCallback, useState } from 'react';

export const useZoomAndPan = ({
  canvasRef,
  zoom,
  setZoom,
  offset,
  setOffset,
  viewportCenter,
  setViewportCenter,
  canvasSize
}) => {
  // State for panning
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);

  // Handle wheel zoom
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
    };

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelEvent);
  }, [zoom, offset, canvasRef, setZoom, setOffset]);

  // Handle viewport centering
  useEffect(() => {
    if (viewportCenter) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const centerX = canvasRect.width / 2;
      const centerY = canvasRect.height / 2;
      
      // Set new zoom level
      const SEARCH_ZOOM_LEVEL = 4;
      setZoom(SEARCH_ZOOM_LEVEL);
      
      // Calculate new offset to center the node with the new zoom level
      const newOffset = {
        x: centerX - (viewportCenter.x * SEARCH_ZOOM_LEVEL),
        y: centerY - (viewportCenter.y * SEARCH_ZOOM_LEVEL)
      };
      
      setOffset(newOffset);
      
      // Clear the viewport center immediately after applying the transformation
      setViewportCenter(null);
    }
  }, [viewportCenter, canvasRef, setZoom, setOffset, setViewportCenter]);

  // Handle image centering
  const centerImage = useCallback((img) => {
    const scaleX = canvasSize.width / img.width;
    const scaleY = canvasSize.height / img.height;
    const baseScale = Math.min(scaleX, scaleY);
    
    setZoom(1);
    setOffset({
      x: canvasSize.width / 2,
      y: canvasSize.height / 2
    });
  }, [canvasSize, setZoom, setOffset]);

  return {
    centerImage,
    isPanning,
    setIsPanning,
    lastPanPoint,
    setLastPanPoint
  };
}; 