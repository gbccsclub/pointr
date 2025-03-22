import { useCallback } from 'react';

export const useCoordinateConversion = (zoom, offset) => {
  const screenToCanvas = useCallback((screenX, screenY) => {
    return {
      x: (screenX - offset.x) / zoom,
      y: (screenY - offset.y) / zoom
    };
  }, [zoom, offset]);

  const canvasToScreen = useCallback((canvasX, canvasY) => {
    return {
      x: canvasX * zoom + offset.x,
      y: canvasY * zoom + offset.y
    };
  }, [zoom, offset]);

  return {
    screenToCanvas,
    canvasToScreen
  };
}; 