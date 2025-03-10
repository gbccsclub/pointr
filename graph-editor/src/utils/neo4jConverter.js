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

export const convertToNeo4j = (nodes, edges) => {
  // Create nodes
  const nodeStatements = nodes.map(node => {
    const numericId = parseInt(node.id.substring(1));
    if (isNaN(numericId)) {
      console.error('Invalid node ID:', node.id);
      return null;
    }
    
    const nodeProps = {
      id: numericId,
      label: node.label,
      type: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y)
    };

    const nodeType = node.type === 'pathNode' ? 'PathNode' : 'RoomNode';
    const varPrefix = node.type === 'pathNode' ? 'n' : 'r';

    return `CREATE (${varPrefix}${numericId}:${nodeType} {
      id: ${nodeProps.id}, 
      label: '${nodeProps.label}', 
      type: '${nodeProps.type}',
      x: ${nodeProps.x}, 
      y: ${nodeProps.y}
    })`;
  }).filter(stmt => stmt !== null);

  // Create relationships with angles
  const edgeStatements = edges.map(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return null;
    
    const fromId = parseInt(fromNode.id.substring(1));
    const toId = parseInt(toNode.id.substring(1));
    
    if (isNaN(fromId) || isNaN(toId)) return null;
    
    const fromPrefix = fromNode.type === 'pathNode' ? 'n' : 'r';
    const toPrefix = toNode.type === 'pathNode' ? 'n' : 'r';
    
    const { angle, reverseAngle, distance } = calculateAngleAndDistance(fromNode, toNode);
    
    // If both nodes are path nodes, create bidirectional edges
    if (fromNode.type === 'pathNode' && toNode.type === 'pathNode') {
      return [
        `CREATE (${fromPrefix}${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${toPrefix}${toId})`,
        `CREATE (${fromPrefix}${fromId})<-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]-(${toPrefix}${toId})`
      ].join('\n');
    }
    
    // For room node connections, create only one direction
    return `CREATE (${fromPrefix}${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${toPrefix}${toId})`;
  }).filter(stmt => stmt !== null);

  return [...nodeStatements, ...edgeStatements].join('\n');
};

// Export the alias after the function is defined
export const generateCypherExport = convertToNeo4j;

export const parseCypherImport = (cypherQuery) => {
  const nodes = new Set();
  const edges = new Set();
  
  // Updated regex patterns to handle both node types with numeric IDs
  const pathNodePattern = /CREATE \((\d+):PathNode {(.+?)}\)/g;
  const roomNodePattern = /CREATE \((\d+):RoomNode {(.+?)}\)/g;
  const edgePattern = /CREATE \((\d+)\)-\[:CONNECTS_TO {(.+?)}\]->\((\d+)\)/g;
  
  // Parse path nodes
  let pathNodeMatch;
  while ((pathNodeMatch = pathNodePattern.exec(cypherQuery)) !== null) {
    const id = pathNodeMatch[1];
    const props = parseProperties(pathNodeMatch[2]);
    nodes.add({
      id: `n${id}`, // Add 'n' prefix for internal use
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
      id: `r${id}`, // Add 'r' prefix for internal use
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
    
    // Find the corresponding nodes to determine their types
    const fromNode = Array.from(nodes).find(n => parseInt(n.id.substring(1)) === parseInt(fromId));
    const toNode = Array.from(nodes).find(n => parseInt(n.id.substring(1)) === parseInt(toId));
    
    if (fromNode && toNode) {
      edges.add({
        id: `edge-${fromNode.id}-${toNode.id}`,
        from: fromNode.id,
        to: toNode.id
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
