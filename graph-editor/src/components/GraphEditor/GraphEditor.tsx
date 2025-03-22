import React, { useState, useRef, useEffect, useCallback } from 'react';
import Controls from './Controls';
import GridControls from './GridControls';
import Canvas from './Canvas';
import ImageOverlay from './ImageOverlay';
import Instructions from './Instructions';
import WorkspaceManager from './WorkspaceManager';
import ModeControls from './ModeControls';
import SearchControls from './SearchControls';
import { useGraphHistory } from './hooks/useGraphHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHighlight } from './hooks/useHighlight';
import { 
  saveToWorkspace, 
  loadFromWorkspace, 
  saveWorkspaceList, 
  loadWorkspaceList,
  saveCurrentWorkspace,
  STORAGE_KEYS 
} from '../../utils/storage';

interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
}

interface Edge {
  id: string;
  from: string;
  to: string;
}

interface Workspace {
  id: string;
  name: string;
  created: number;
}

const GraphEditor: React.FC = () => {
  // Workspace state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspaceList());
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  
  // Graph state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [imageOpacity, setImageOpacity] = useState<number>(0.5);
  const [nodeCounter, setNodeCounter] = useState<number>(0);
  const [roomCounter, setRoomCounter] = useState<number>(0);
  const { highlightedNode, setHighlightedNode, highlightOpacity } = useHighlight();
  
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

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      const data = loadFromWorkspace(workspaceId);
      setNodes(data.nodes);
      setEdges(data.edges);
      setOverlayImage(data.overlayImage);
      setImageOpacity(data.imageOpacity);
      setNodeCounter(data.nodeCounter);
      setRoomCounter(data.roomCounter);
      setCurrentWorkspace(workspace);
      saveCurrentWorkspace(workspaceId);
    }
  };

  const handleWorkspaceCreate = (name: string) => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      created: Date.now()
    };
    
    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    saveWorkspaceList(updatedWorkspaces);
    handleWorkspaceChange(newWorkspace.id);
  };

  const handleWorkspaceDelete = (workspaceId: string) => {
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

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingFrom, setDrawingFrom] = useState<Node | null>(null);
  const [gridSize, setGridSize] = useState<number>(10);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDistances, setShowDistances] = useState<boolean>(false); // Changed from true to false
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: window.innerWidth, height: window.innerHeight });
  const [editorMode, setEditorMode] = useState<string>('select');  // Change default mode to select
  const [nodeSize, setNodeSize] = useState<number>(3);

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
    handleDeleteEdge,
    setEditorMode
  });

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
    setIsDrawing(false);
    setDrawingFrom(null);
  };

  const handleEdgeCreate = (fromNode: Node, toNode: Node) => {
    if (fromNode && toNode && fromNode !== toNode) {
      // Check if an edge already exists between these nodes in either direction
      const edgeExists = edges.some(edge => 
        (edge.from === fromNode.id && edge.to === toNode.id) ||
        (edge.from === toNode.id && edge.to === fromNode.id)
      );

      if (!edgeExists) {
        const newEdge: Edge = {
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

  const handleImageUpload = useCallback((imageData: string) => {
    setOverlayImage(imageData);
  }, []);

  const handleImageToggle = (show: boolean) => {
    setImageOpacity(show ? 0.5 : 0);
  };

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
          nodeCounter,
          roomCounter
        );
      }, 1000);

      return () => clearTimeout(saveTimeout);
    }
  }, [currentWorkspace, nodes, edges, overlayImage, imageOpacity, nodeCounter, roomCounter]);

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this function to handle node counter changes
  const handleNodeCounterChange = useCallback((newCounter: number) => {
    setNodeCounter(newCounter);
    if (currentWorkspace) {
      saveToWorkspace(
        currentWorkspace.id,
        nodes,
        edges,
        overlayImage,
        imageOpacity,
        newCounter,
        roomCounter
      );
    }
  }, [currentWorkspace, nodes, edges, overlayImage, imageOpacity, roomCounter]);

  const handleRoomCounterChange = useCallback((newCounter: number) => {
    setRoomCounter(newCounter);
    if (currentWorkspace) {
      saveToWorkspace(
        currentWorkspace.id,
        nodes,
        edges,
        overlayImage,
        imageOpacity,
        nodeCounter,
        newCounter
      );
    }
  }, [currentWorkspace, nodes, edges, overlayImage, imageOpacity, nodeCounter]);

  // Add this state for viewport control
  const [viewportCenter, setViewportCenter] = useState<{ x: number; y: number } | null>(null);

  // Add this handler function
  const handleNodeSearch = (node: Node) => {
    setSelectedNode(node);
    // Set viewport center to trigger zoom and centering
    setViewportCenter({ x: node.x, y: node.y });
    // Also set the highlighted node for the blinking effect
    setHighlightedNode(node);
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Add WorkspaceManager to the top */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <WorkspaceManager
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={handleWorkspaceChange}
          onWorkspaceCreate={handleWorkspaceCreate}
          onWorkspaceDelete={handleWorkspaceDelete}
        />
        <SearchControls
          nodes={nodes}
          onNodeSelect={handleNodeSearch}
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
        />
      </div>

      {/* Mode controls container */}
      <div className="fixed top-20 left-4 z-50">
        <ModeControls 
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
          selectedEdge={selectedEdge}
          editorMode={editorMode}
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
        initialRoomCounter={roomCounter}
        onNodeCounterChange={handleNodeCounterChange}
        onRoomCounterChange={handleRoomCounterChange}
        viewportCenter={viewportCenter}
        setViewportCenter={setViewportCenter}
        highlightedNode={highlightedNode}
        highlightOpacity={highlightOpacity}
      />
    </div>
  );
};

export default GraphEditor;
