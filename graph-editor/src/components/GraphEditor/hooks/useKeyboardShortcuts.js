import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ 
  selectedNode, 
  selectedEdge, 
  handleUndo, 
  handleDeleteNode,
  handleDeleteEdge 
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedNode) {
          handleDeleteNode();
        } else if (selectedEdge) {
          handleDeleteEdge();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleDeleteNode, handleDeleteEdge, selectedNode, selectedEdge]);
};
