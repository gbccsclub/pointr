import { useState, useEffect } from 'react';

export const useHighlight = () => {
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [highlightOpacity, setHighlightOpacity] = useState(1);

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

  return {
    highlightedNode,
    setHighlightedNode,
    highlightOpacity
  };
}; 