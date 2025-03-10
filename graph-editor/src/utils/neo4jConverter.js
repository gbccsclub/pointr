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
    const numericId = extractNodeId(node.id);
    return `CREATE (n${numericId}:Node {id: ${numericId}, label: '${node.label}', x: ${node.x}, y: ${node.y}})`;
  });

  // Create bidirectional relationships with angles from both perspectives
  const edgeStatements = edges.flatMap(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    const { angle, reverseAngle, distance } = calculateAngleAndDistance(fromNode, toNode);
    
    const fromId = extractNodeId(edge.from);
    const toId = extractNodeId(edge.to);
    
    return [
      // Forward direction
      `CREATE (n${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(n${toId})`,
      // Reverse direction
      `CREATE (n${toId})-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]->(n${fromId})`
    ];
  });

  return [...nodeStatements, ...edgeStatements].join('\n');
};

export const parseCypherImport = (cypherQuery) => {
  const nodes = new Set();
  const edges = new Set();
  
  // Simple regex patterns for parsing
  const nodePattern = /CREATE \((\w+):Node {(.+?)}\)/g;
  const edgePattern = /CREATE \((\w+)\)-\[:CONNECTS_TO {(.+?)}\]->\((\w+)\)/g;
  
  // Parse nodes
  let nodeMatch;
  while ((nodeMatch = nodePattern.exec(cypherQuery)) !== null) {
    const properties = Object.fromEntries(
      nodeMatch[2].split(', ')
        .map(prop => prop.split(': '))
        .map(([key, value]) => [key, value.replace(/['"]/g, '')])
    );
    
    nodes.add({
      id: `node-${properties.id}`,
      label: properties.label,
      x: parseInt(properties.x),
      y: parseInt(properties.y)
    });
  }
  
  // Parse edges (only store one direction since we create bidirectional edges)
  let edgeMatch;
  while ((edgeMatch = edgePattern.exec(cypherQuery)) !== null) {
    const fromId = parseInt(edgeMatch[1].replace('n', ''));
    const toId = parseInt(edgeMatch[3].replace('n', ''));
    
    // Only add edge if we haven't seen its reverse yet
    const edgeKey = `${Math.min(fromId, toId)}-${Math.max(fromId, toId)}`;
    if (!edges.has(edgeKey)) {
      edges.add(edgeKey);
      edges.add({
        id: `edge-node-${fromId}-node-${toId}`,
        from: `node-${fromId}`,
        to: `node-${toId}`
      });
    }
  }
  
  return { 
    nodes: Array.from(nodes), 
    edges: Array.from(edges).filter(edge => typeof edge === 'object')
  };
};
