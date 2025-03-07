const floorMap = {
    1: [[2, 'E'], [7, 'S']],
    2: [[1, 'W'], [3, 'N'], [5, 'E']],
    3: [[2, 'S'], [4, 'W']],
    4: [[3, 'W'], [5, 'S']],
    5: [[2, 'W'], [4, 'N'], [6, 'S']],
    6: [[5, 'N'], [7, 'W']],
    7: [[6, 'E'], [1, 'N']],
};

function dijkstra(graph, startNode, endNode) {
    // Initialize distances with Infinity for all nodes except the start node
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Initialize all nodes
    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
        unvisited.add(parseInt(node));
    }

    // Distance from start to itself is 0
    distances[startNode] = 0;

    // Path information to track directions
    const pathInfo = {};

    while (unvisited.size > 0) {
        // Find the unvisited node with the smallest distance
        let current = null;
        let smallestDistance = Infinity;

        for (const node of unvisited) {
            if (distances[node] < smallestDistance) {
                smallestDistance = distances[node];
                current = node;
            }
        }

        // If we've reached the end node or there's no path (smallest distance is Infinity)
        if (current === endNode || smallestDistance === Infinity) {
            break;
        }

        // Remove current from unvisited
        unvisited.delete(current);

        // For each neighbor of the current node
        for (const [neighbor, direction] of graph[current] || []) {
            // Each edge has a weight of 1 in this implementation
            const distance = distances[current] + 1;

            // If we found a shorter path to the neighbor
            if (distance < distances[neighbor]) {
                distances[neighbor] = distance;
                previous[neighbor] = current;
                pathInfo[`${current}-${neighbor}`] = direction;
            }
        }
    }

    // Reconstruct the path
    const path = [];
    const directions = [];
    let current = endNode;

    // If there's no path to the end node
    if (previous[endNode] === null && endNode !== startNode) {
        return { path: [], directions: [], distance: Infinity };
    }

    while (current !== null) {
        path.unshift(current);
        if (previous[current] !== null) {
            const edge = `${previous[current]}-${current}`;
            directions.unshift(pathInfo[edge]);
        }
        current = previous[current];
    }

    return {
        path,
        directions: directions,
        distance: distances[endNode]
    };
}

console.log(dijkstra(floorMap, 1, 4));