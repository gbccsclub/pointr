import { useState, useCallback } from 'react';

export const useGraphHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentStateIndex, setCurrentStateIndex] = useState(-1);

  const saveToHistory = useCallback((state) => {
    const newHistory = history.slice(0, currentStateIndex + 1);
    newHistory.push({
      nodes: [...state.nodes],
      edges: [...state.edges]
    });
    setHistory(newHistory);
    setCurrentStateIndex(newHistory.length - 1);
  }, [history, currentStateIndex]);

  const handleUndo = useCallback(() => {
    if (currentStateIndex > 0) {
      const previousState = history[currentStateIndex - 1];
      setCurrentStateIndex(currentStateIndex - 1);
      return previousState;
    }
    return null;
  }, [history, currentStateIndex]);

  const canUndo = currentStateIndex > 0;

  return {
    history,
    currentStateIndex,
    saveToHistory,
    handleUndo,
    canUndo
  };
};
