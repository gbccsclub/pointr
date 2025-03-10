export const calculateAngleAndDistance = (fromNode, toNode) => {
  const dx = toNode.x - fromNode.x;
  const dy = fromNode.y - toNode.y; // Negative because Y grows downward in canvas
  
  // Calculate angle in degrees (0° is right, going counterclockwise)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle < 0) angle += 360; // Convert negative angles to positive
  
  // Calculate distance
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return {
    angle: Math.round(angle),
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

  // Create relationships with angle and distance
  const edgeStatements = edges.map(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    const { angle, distance } = calculateAngleAndDistance(fromNode, toNode);
    
    const fromId = extractNodeId(edge.from);
    const toId = extractNodeId(edge.to);
    
    return `CREATE (n${fromId})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(n${toId})`;
  });

  return [...nodeStatements, ...edgeStatements].join('\n');
};

export const parseCypherImport = (cypherQuery) => {
  const nodes = [];
  const edges = [];
  
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
    
    nodes.push({
      id: `node-${properties.id}`,
      label: properties.label,
      x: parseInt(properties.x),
      y: parseInt(properties.y)
    });
  }
  
  // Parse edges
  let edgeMatch;
  while ((edgeMatch = edgePattern.exec(cypherQuery)) !== null) {
    const fromNodeId = `node-${edgeMatch[1].replace('n', '')}`;
    const toNodeId = `node-${edgeMatch[3].replace('n', '')}`;
    
    edges.push({
      id: `edge-${fromNodeId}-${toNodeId}`,
      from: fromNodeId,
      to: toNodeId
    });
  }
  
  return { nodes, edges };
};
