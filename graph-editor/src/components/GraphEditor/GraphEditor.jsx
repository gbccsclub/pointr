import React, { useState, useRef, useEffect } from 'react';
import Controls from './Controls';
import GridControls from './GridControls';
import Canvas from './Canvas';
import ImageOverlay from './ImageOverlay';
import Instructions from './Instructions';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const GraphEditor = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingFrom, setDrawingFrom] = useState(null);
  const [gridSize, setGridSize] = useState(15);
  const [showGrid, setShowGrid] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);

  const { history, currentStateIndex, saveToHistory, handleUndo, canUndo } = useGraphHistory();

  const handleUndoAction = () => {
    const previousState = handleUndo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      
      // Clear selection if the selected node no longer exists
      if (selectedNode && !previousState.nodes.find(n => n.id === selectedNode.id)) {
        setSelectedNode(null);
      }
      
      // Clear drawing state
      setIsDrawing(false);
      setDrawingFrom(null);
    }
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    // Remove all edges connected to this node
    const filteredEdges = edges.filter(edge => 
      edge.from !== selectedNode.id && edge.to !== selectedNode.id
    );
    
    // Remove the node itself
    const filteredNodes = nodes.filter(node => node.id !== selectedNode.id);
    
    // Save the new state
    setEdges(filteredEdges);
    setNodes(filteredNodes);
    setSelectedNode(null);
    saveToHistory({ nodes: filteredNodes, edges: filteredEdges });
  };

  useKeyboardShortcuts({
    selectedNode,
    handleUndo: handleUndoAction,
    handleDeleteNode
  });

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setIsDrawing(false);
    setDrawingFrom(null);
  };

  const handleEdgeCreate = (fromNode, toNode) => {
    if (fromNode && toNode && fromNode !== toNode) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        from: fromNode.id,
        to: toNode.id
      };
      
      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      saveToHistory({ nodes, edges: newEdges });
    }
    setIsDrawing(false);
    setDrawingFrom(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Top controls container */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex flex-col gap-4">
          <Controls 
            handleUndo={handleUndoAction}
            canUndo={canUndo}
            selectedNode={selectedNode}
            onDeleteNode={handleDeleteNode}
          />
          
          <ImageOverlay 
            image={overlayImage}
            opacity={imageOpacity}
            onImageUpload={setOverlayImage}
            onOpacityChange={setImageOpacity}
          />
        </div>
      </div>

      {/* Bottom controls container */}
      <div className="fixed bottom-4 left-4 z-50">
        <GridControls
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          showDistances={showDistances}
          setShowDistances={setShowDistances}
          gridSize={gridSize}
          setGridSize={setGridSize}
        />
      </div>

      {/* Instructions panel */}
      <div className="fixed top-4 right-4 z-50">
        <Instructions 
          nodes={nodes}
          edges={edges}
          gridSize={gridSize}
          selectedNode={selectedNode}
        />
      </div>

      {/* Full-screen canvas */}
      <Canvas 
        nodes={nodes}
        edges={edges}
        selectedNode={selectedNode}
        isDrawing={isDrawing}
        drawingFrom={drawingFrom}
        gridSize={gridSize}
        showGrid={showGrid}
        showDistances={showDistances}
        snapToGrid={snapToGrid}
        canvasSize={canvasSize}
        overlayImage={overlayImage}
        imageOpacity={imageOpacity}
        setNodes={setNodes}
        setEdges={setEdges}
        setSelectedNode={handleNodeSelect}
        setIsDrawing={setIsDrawing}
        setDrawingFrom={setDrawingFrom}
        saveToHistory={saveToHistory}
        onEdgeCreate={handleEdgeCreate}
      />
    </div>
  );
};

export default GraphEditor;
