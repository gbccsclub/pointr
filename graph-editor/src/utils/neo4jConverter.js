export const calculateAngleAndDistance = (fromNode, toNode) => {
  const dx = toNode.x - fromNode.x;
  const dy = fromNode.y - toNode.y; // Negative because Y grows downward in canvas
  
  // Calculate angle in degrees (0° is right, going counterclockwise)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360; // Convert negative angles to positive
  
  // Calculate reverse angle (opposite direction)
  let reverseAngle = (angle + 180) % 360;
  
  // Calculate distance
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return {
    angle: Math.round(angle),
    reverseAngle: Math.round(reverseAngle),
    distance: Math.round(distance)
  };
};

export const parseCypherImport = (cypherQuery) => {
  const nodes = [];
  const edges = [];
  
  // Updated regex patterns
  const nodePattern = /CREATE \(([nr]\d+):(\w+Node) \{([^}]+)\}/g;
  const forwardEdgePattern = /CREATE \(([nr]\d+)\)-\[:CONNECTS_TO \{([^}]+)\}\]->\(([nr]\d+)\)/g;
  const reverseEdgePattern = /CREATE \(([nr]\d+)\)<-\[:CONNECTS_TO \{([^}]+)\}\]-\(([nr]\d+)\)/g;

  // Helper function to parse properties
  const parseProperties = (propsString) => {
    const props = {};
    propsString.split(',').forEach(prop => {
      const [key, rawValue] = prop.split(':').map(s => s.trim());
      // Handle string values (wrapped in quotes)
      if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
        props[key] = rawValue.slice(1, -1);
      } else {
        // Handle numeric values
        props[key] = Number(rawValue);
      }
    });
    return props;
  };

  // Parse nodes
  let nodeMatch;
  let maxPathNodeId = -1;
  let maxRoomNodeId = -1;

  while ((nodeMatch = nodePattern.exec(cypherQuery)) !== null) {
    const [_, nodeId, nodeType, propsString] = nodeMatch;
    const props = parseProperties(propsString);
    
    // Extract numeric ID from nodeId (remove 'n' or 'r' prefix)
    const numericId = parseInt(nodeId.substring(1));
    
    // Track highest ID for each node type
    if (nodeId.startsWith('n')) {
      maxPathNodeId = Math.max(maxPathNodeId, numericId);
    } else if (nodeId.startsWith('r')) {
      maxRoomNodeId = Math.max(maxRoomNodeId, numericId);
    }
    
    nodes.push({
      id: nodeId,  // Keep the original nodeId with prefix (n1, r1, etc.)
      type: nodeType === 'PathNode' ? 'pathNode' : 'roomNode',
      label: props.label || nodeId,
      x: props.x || 0,
      y: props.y || 0
    });
  }

  // Function to create edge
  const createEdge = (fromId, toId) => ({
    id: `${fromId}-${toId}`,
    from: fromId,
    to: toId
  });

  // Parse forward edges
  let forwardEdgeMatch;
  while ((forwardEdgeMatch = forwardEdgePattern.exec(cypherQuery)) !== null) {
    const [_, fromId, propsString, toId] = forwardEdgeMatch;
    edges.push(createEdge(fromId, toId));
  }

  // Parse reverse edges
  let reverseEdgeMatch;
  while ((reverseEdgeMatch = reverseEdgePattern.exec(cypherQuery)) !== null) {
    const [_, toId, propsString, fromId] = reverseEdgeMatch;
    edges.push(createEdge(fromId, toId));
  }

  return {
    nodes: nodes,
    edges: edges.filter((edge, index, self) => 
      index === self.findIndex(e => 
        (e.from === edge.from && e.to === edge.to) || 
        (e.from === edge.to && e.to === edge.from)
      )
    ), // Remove duplicate edges
    nodeCounter: maxPathNodeId + 1, // Next available path node ID
    roomCounter: maxRoomNodeId + 1  // Next available room node ID
  };
};

export const generateCypherExport = (nodes, edges) => {
  const nodeStatements = nodes.map(node => {
    const nodeType = node.type === 'pathNode' ? 'PathNode' : 'RoomNode';
    return `CREATE (${node.id}:${nodeType} {
      id: ${parseInt(node.id.substring(1))},
      label: '${node.label}',
      type: '${node.type}',
      x: ${Math.round(node.x)},
      y: ${Math.round(node.y)}
    })`;
  });

  const processedEdges = new Set();
  const edgeStatements = edges.flatMap(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return [];
    
    const edgeKey = [edge.from, edge.to].sort().join('-');
    if (processedEdges.has(edgeKey)) return [];
    processedEdges.add(edgeKey);

    const { angle, reverseAngle, distance } = calculateAngleAndDistance(fromNode, toNode);

    if (fromNode.type === 'pathNode' && toNode.type === 'pathNode') {
      return [
        `CREATE (${edge.from})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${edge.to})`,
        `CREATE (${edge.from})<-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]-(${edge.to})`
      ];
    }

    return [
      `CREATE (${edge.from})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${edge.to})`
    ];
  });

  return [...nodeStatements, ...edgeStatements].join('\n');
};
