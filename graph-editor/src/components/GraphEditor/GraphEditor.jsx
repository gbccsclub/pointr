import React, { useState, useRef, useEffect, useCallback } from 'react';
import Controls from './Controls';
import GridControls from './GridControls';
import Canvas from './Canvas';
import ImageOverlay from './ImageOverlay';
import Instructions from './Instructions';
import WorkspaceManager from './WorkspaceManager';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { 
  saveToWorkspace, 
  loadFromWorkspace, 
  saveWorkspaceList, 
  loadWorkspaceList,
  saveCurrentWorkspace,
  STORAGE_KEYS 
} from '../../utils/storage';

const GraphEditor = () => {
  // Workspace state
  const [workspaces, setWorkspaces] = useState(loadWorkspaceList());
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  
  // Graph state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [nodeCounter, setNodeCounter] = useState(0);
  
  // Load current workspace on mount
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem(STORAGE_KEYS.CURRENT_WORKSPACE);
    if (savedWorkspaceId && workspaces.find(w => w.id === savedWorkspaceId)) {
      handleWorkspaceChange(savedWorkspaceId);
    } else if (workspaces.length > 0) {
      handleWorkspaceChange(workspaces[0].id);
    } else {
      // Create default workspace if none exists
      handleWorkspaceCreate('Default Workspace');
    }
  }, []);

  const handleWorkspaceChange = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      const data = loadFromWorkspace(workspaceId);
      setNodes(data.nodes);
      setEdges(data.edges);
      setOverlayImage(data.overlayImage);
      setImageOpacity(data.imageOpacity);
      setNodeCounter(data.nodeCounter);
      setCurrentWorkspace(workspace);
      saveCurrentWorkspace(workspaceId);
    }
  };

  const handleWorkspaceCreate = (name) => {
    const newWorkspace = {
      id: `workspace-${Date.now()}`,
      name,
      created: Date.now()
    };
    
    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    saveWorkspaceList(updatedWorkspaces);
    handleWorkspaceChange(newWorkspace.id);
  };

  const handleWorkspaceDelete = (workspaceId) => {
    // Remove workspace data
    const workspaceKey = `graph-editor-workspace-${workspaceId}`;
    localStorage.removeItem(workspaceKey);
    
    // Update workspaces list
    const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
    saveWorkspaceList(updatedWorkspaces);

    // Switch to another workspace
    if (updatedWorkspaces.length > 0) {
      handleWorkspaceChange(updatedWorkspaces[0].id);
    } else {
      // Create a new default workspace if none exists
      handleWorkspaceCreate('Default Workspace');
    }
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingFrom, setDrawingFrom] = useState(null);
  const [gridSize, setGridSize] = useState(10);
  const [showGrid, setShowGrid] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [editorMode, setEditorMode] = useState('node');
  const [nodeSize, setNodeSize] = useState(6);

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

  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    
    const filteredEdges = edges.filter(edge => edge.id !== selectedEdge.id);
    setEdges(filteredEdges);
    setSelectedEdge(null);
    saveToHistory({ nodes, edges: filteredEdges });
  };

  useKeyboardShortcuts({
    selectedNode,
    selectedEdge,
    handleUndo: handleUndoAction,
    handleDeleteNode,
    handleDeleteEdge
  });

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setIsDrawing(false);
    setDrawingFrom(null);
  };

  const handleEdgeCreate = (fromNode, toNode) => {
    if (fromNode && toNode && fromNode !== toNode) {
      // Check if an edge already exists between these nodes in either direction
      const edgeExists = edges.some(edge => 
        (edge.from === fromNode.id && edge.to === toNode.id) ||
        (edge.from === toNode.id && edge.to === fromNode.id)
      );

      if (!edgeExists) {
        const newEdge = {
          id: `edge-${Date.now()}`,
          from: fromNode.id,
          to: toNode.id
        };
        
        const newEdges = [...edges, newEdge];
        setEdges(newEdges);
        saveToHistory({ nodes, edges: newEdges });
      }
    }
  };

  const handleImageUpload = useCallback((imageData) => {
    setOverlayImage(imageData);
  }, []);

  const handleImageToggle = (show) => {
    setImageOpacity(show ? 0.5 : 0);
  };

  const handleNeo4jImport = useCallback((importedNodes, importedEdges) => {
    setNodes(importedNodes);
    setEdges(importedEdges);
    setSelectedNode(null);
    setIsDrawing(false);
    setDrawingFrom(null);
    saveToHistory({ nodes: importedNodes, edges: importedEdges });
    // Storage will be handled by the effect
  }, [saveToHistory]);

  // Add debounced save effect
  useEffect(() => {
    if (currentWorkspace) {
      const saveTimeout = setTimeout(() => {
        saveToWorkspace(
          currentWorkspace.id,
          nodes,
          edges,
          overlayImage,
          imageOpacity,
          Math.max(...nodes.map(n => parseInt(n.id.replace('node-', ''), 10)), -1) + 1
        );
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [currentWorkspace, nodes, edges, overlayImage, imageOpacity]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this function to handle node counter changes
  const handleNodeCounterChange = useCallback((newCounter) => {
    setNodeCounter(newCounter);
    if (currentWorkspace) {
      saveToWorkspace(
        currentWorkspace.id,
        nodes,
        edges,
        overlayImage,
        imageOpacity,
        newCounter
      );
    }
  }, [currentWorkspace, nodes, edges, overlayImage, imageOpacity]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Add WorkspaceManager to the top */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <WorkspaceManager
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={handleWorkspaceChange}
          onWorkspaceCreate={handleWorkspaceCreate}
          onWorkspaceDelete={handleWorkspaceDelete}
        />
      </div>

      {/* Top controls container */}
      <div className="fixed top-4 left-4 z-50">
        <Controls 
          handleUndo={handleUndoAction}
          canUndo={canUndo}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={handleDeleteEdge}
          image={overlayImage}
          opacity={imageOpacity}
          onImageUpload={handleImageUpload}
          onOpacityChange={setImageOpacity}
          onImageToggle={handleImageToggle}
          nodes={nodes}
          edges={edges}
          onImport={handleNeo4jImport}
          editorMode={editorMode}
          onModeChange={setEditorMode}
        />
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
          nodeSize={nodeSize}
          setNodeSize={setNodeSize}
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
        editorMode={editorMode}
        selectedEdge={selectedEdge}
        setSelectedEdge={setSelectedEdge}
        nodeSize={nodeSize}
        initialNodeCounter={nodeCounter}
        onNodeCounterChange={handleNodeCounterChange}
      />
    </div>
  );
};

export default GraphEditor;
