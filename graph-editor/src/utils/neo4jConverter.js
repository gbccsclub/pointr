export const calculateAngleAndDistance = (fromNode, toNode) => {
  const dx = toNode.x - fromNode.x;
  const dy = fromNode.y - fromNode.y; // Negative because Y grows downward in canvas
  
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

export const generateCypherExport = (nodes, edges) => {
  const nodeStatements = nodes.map(node => {
    const nodeType = node.type === 'pathNode' ? 'PathNode' : 'RoomNode';
    return `CREATE (${node.id}:${nodeType} { id: ${parseInt(node.id.substring(1))} })`;
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

    // If both nodes are path nodes, create bidirectional connection
    if (fromNode.type === 'pathNode' && toNode.type === 'pathNode') {
      return [
        `CREATE (${edge.from})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${edge.to})`,
        `CREATE (${edge.from})<-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]-(${edge.to})`
      ];
    }

    // If one node is path and other is room, ensure direction is from path to room
    if (fromNode.type === 'pathNode' && toNode.type === 'roomNode') {
      return [
        `CREATE (${edge.from})-[:CONNECTS_TO {angle: ${angle}, distance: ${distance}}]->(${edge.to})`
      ];
    } else if (fromNode.type === 'roomNode' && toNode.type === 'pathNode') {
      return [
        `CREATE (${toNode.id})-[:CONNECTS_TO {angle: ${reverseAngle}, distance: ${distance}}]->(${fromNode.id})`
      ];
    }

    return [];
  });

  return [...nodeStatements, ...edgeStatements].join('\n');
};
