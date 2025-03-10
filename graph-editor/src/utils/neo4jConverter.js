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

const extractNodeId = (nodeId) => parseInt(nodeId.replace('node-', ''));

export const generateCypherExport = (nodes, edges) => {
  // Create nodes
  const nodeStatements = nodes.map(node => {
    const nodeProps = {
      id: node.type === 'pathNode' ? 
        parseInt(node.id) : 
        node.id,
      label: node.label,
      type: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y)
    };

    const nodeType = node.type === 'pathNode' ? 'PathNode' : 'RoomNode';
    const nodeId = node.type === 'pathNode' ? 
      `n${nodeProps.id}` : 
      `r${nodeProps.id}`;

    return `CREATE (${nodeId}:${nodeType} {
      id: ${typeof nodeProps.id === 'number' ? nodeProps.id : `'${nodeProps.id}'`}, 
      label: '${nodeProps.label}', 
      type: '${nodeProps.type}',
      x: ${nodeProps.x}, 
      y: ${nodeProps.y}
    })`;
  });

  // Create relationships with angles
  const edgeStatements = edges.flatMap(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    const { angle, reverseAngle, distance } = calculateAngleAndDistance(fromNode, toNode);
    
    const fromId = fromNode.type === 'pathNode' ? 
      `n${edge.from}` : 
      `r${edge.from}`;
    const toId = toNode.type === 'pathNode' ? 
      `n${edge.to}` : 
      `r${edge.to}`;
    
    // If either node is a room node, check the direction
    if (fromNode.type === 'roomNode' || toNode.type === 'roomNode') {
      // Only create edge if it's from pathNode to roomNode
      if (fromNode.type === 'pathNode' && toNode.type === 'roomNode') {
        return [`CREATE (${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${toId})`];
      }
      return []; // Skip edge creation for roomNode to pathNode
    }

    // For path node to path node connections, create bidirectional edges
    return [
      `CREATE (${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${toId})`,
      `CREATE (${fromId})<-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]-(${toId})`
    ];
  });

  return [...nodeStatements, ...edgeStatements].join('\n');
};

export const parseCypherImport = (cypherQuery) => {
  const nodes = new Set();
  const edges = new Set();
  
  // Updated regex patterns to handle both node types
  const pathNodePattern = /CREATE \(n(\d+):PathNode {(.+?)}\)/g;
  const roomNodePattern = /CREATE \(r(\w+):RoomNode {(.+?)}\)/g;
  const edgePattern = /CREATE \((\w+)\)-\[:CONNECTS_TO {(.+?)}\]->\((\w+)\)/g;
  
  // Parse path nodes
  let pathNodeMatch;
  while ((pathNodeMatch = pathNodePattern.exec(cypherQuery)) !== null) {
    const id = pathNodeMatch[1];
    const props = parseProperties(pathNodeMatch[2]);
    nodes.add({
      id: id,
      type: 'pathNode',
      label: props.label,
      x: parseInt(props.x),
      y: parseInt(props.y)
    });
  }
  
  // Parse room nodes
  let roomNodeMatch;
  while ((roomNodeMatch = roomNodePattern.exec(cypherQuery)) !== null) {
    const id = roomNodeMatch[1];
    const props = parseProperties(roomNodeMatch[2]);
    nodes.add({
      id: id,
      type: 'roomNode',
      label: props.label,
      x: parseInt(props.x),
      y: parseInt(props.y)
    });
  }
  
  // Parse edges
  let edgeMatch;
  while ((edgeMatch = edgePattern.exec(cypherQuery)) !== null) {
    const fromId = edgeMatch[1];
    const toId = edgeMatch[3];
    
    // Convert node IDs to the correct format
    const from = fromId.startsWith('n') ? fromId.slice(1) : fromId.slice(1);
    const to = toId.startsWith('n') ? toId.slice(1) : toId.slice(1);
    
    // Only add edge if we haven't seen its reverse yet
    const edgeKey = `${Math.min(from, to)}-${Math.max(from, to)}`;
    if (!edges.has(edgeKey)) {
      edges.add(edgeKey);
      edges.add({
        id: `edge-${from}-${to}`,
        from,
        to
      });
    }
  }
  
  return { 
    nodes: Array.from(nodes), 
    edges: Array.from(edges).filter(edge => typeof edge === 'object')
  };
};

// Helper function to parse property string into object
const parseProperties = (propString) => {
  const props = {};
  const matches = propString.match(/\w+:\s*('[^']*'|\d+)/g);
  if (matches) {
    matches.forEach(match => {
      const [key, value] = match.split(':').map(s => s.trim());
      props[key] = value.replace(/'/g, '');
    });
  }
  return props;
};
