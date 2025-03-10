import { useEffect } from 'react';

export const useKeyboardShortcuts = ({ 
  selectedNode, 
  selectedEdge, 
  handleUndo, 
  handleDeleteNode,
  handleDeleteEdge,
  setEditorMode
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore shortcuts if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

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

      // Mode switching shortcuts
      switch (event.key.toLowerCase()) {
        case 'p':
          event.preventDefault();
          setEditorMode('pathNode');
          break;
        case 'r':
          event.preventDefault();
          setEditorMode('roomNode');
          break;
        case 'c':
          event.preventDefault();
          setEditorMode('edge');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleDeleteNode, handleDeleteEdge, selectedNode, selectedEdge, setEditorMode]);
};
