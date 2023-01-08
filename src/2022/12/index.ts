import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

type PathNode = {
  id: number;
  x: number;
  y: number;
  z: number;
  f_score: number;
  g_score: number;
  h_score: number;
  parent?: PathNode;
};

// type PathNode = PathNode & { parent?: PathNode };

function createHeightmap(dataString: string): Array<Array<PathNode>> {
  const LOWER_A = "a".charCodeAt(0);
  const LOWER_Z = "z".charCodeAt(0);
  const CHAR_CODE_DELTA = 0 - LOWER_A;
  const rows = dataString.split("\n");
  const ROWLENGTH = rows[0].length;

  const heightMap = rows.map((r, rowIndex) => {
    return r.split("").map((col, colIndex) => {
      switch (col) {
        case "S":
          return {
            id: ROWLENGTH * rowIndex + colIndex,
            x: colIndex,
            y: rowIndex,
            z: LOWER_A + CHAR_CODE_DELTA,
            f_score: 0,
            g_score: 0,
            h_score: 0,
          };
        case "E":
          return {
            id: ROWLENGTH * rowIndex + colIndex,
            x: colIndex,
            y: rowIndex,
            z: LOWER_Z + CHAR_CODE_DELTA,
            f_score: 0,
            g_score: 0,
            h_score: 0,
          };
        default:
          return {
            id: ROWLENGTH * rowIndex + colIndex,
            x: colIndex,
            y: rowIndex,
            z: col.charCodeAt(0) + CHAR_CODE_DELTA,
            f_score: 0,
            g_score: 0,
            h_score: 0,
          };
      }
    });
  });

  return heightMap;
}

function createGraph(heightMap: Array<Array<PathNode>>): Graph {
  const numNodes = heightMap.reduce((agg, curr) => agg + curr.length, 0);

  const theGraph = new Graph(numNodes);

  heightMap.forEach((row, rowIndex) => {
    row.forEach((currentNode, colIndex) => {
      // const thisNodeId = rowIndex * row.length + colIndex;
      // const thisNodeId = currentNode.id;

      // left
      const leftNode = heightMap[rowIndex][colIndex - 1];
      if (leftNode && leftNode.z - currentNode.z <= 1) {
        // currentNode.neighbors.push(heightMap[rowIndex][colIndex - 1]);
        // const otherNode = heightMap[rowIndex * row.length + (colIndex - 1)];
        theGraph.addEdge(currentNode, leftNode);
      }

      // right
      const rightNode = heightMap[rowIndex][colIndex + 1];
      if (rightNode && rightNode.z - currentNode.z <= 1) {
        // currentNode.neighbors.push(heightMap[rowIndex][colIndex + 1]);
        // const otherNode = rowIndex * row.length + (colIndex + 1);
        theGraph.addEdge(currentNode, rightNode);
      }

      // up
      const upNode = heightMap[rowIndex - 1]?.[colIndex];
      if (upNode && upNode.z - currentNode.z <= 1) {
        // currentNode.neighbors.push(heightMap[rowIndex - 1][colIndex]);
        // const otherNode = (rowIndex - 1) * row.length + colIndex;
        theGraph.addEdge(currentNode, upNode);
      }

      // down
      const downNode = heightMap[rowIndex + 1]?.[colIndex];
      if (downNode && downNode.z - currentNode.z <= 1) {
        // currentNode.neighbors.push(heightMap[rowIndex + 1][colIndex]);
        // const otherNode = (rowIndex + 1) * row.length + colIndex;
        theGraph.addEdge(currentNode, downNode);
      }
    });
  });

  return theGraph;
}

function manhattanDistance(from: PathNode, to: PathNode): number {
  const d1 = Math.abs(from.x - to.x);
  const d2 = Math.abs(from.y - to.y);
  return d1 + d2;
}

class Graph {
  public readonly adjacencies: Array<Array<PathNode>>;
  public readonly nodes: Array<PathNode> = [];

  constructor(numNodes: number) {
    this.adjacencies = [];
    for (let index = 0; index < numNodes; index++) {
      this.adjacencies.push([]);
    }
  }

  addEdge(from: PathNode, to: PathNode) {
    if (!this.nodes.map((e) => e.id).includes(from.id)) {
      this.nodes.push(from);
      this.nodes.sort((a, b) => a.id - b.id);
    }
    this.adjacencies[from.id].push(to);
  }

  shortestPath(start: number, end: number): Array<PathNode> {
    // initialize all node's parents to be undefined at start!
    this.nodes.forEach((n) => (n.parent = undefined));

    const openSet: Array<PathNode> = [];
    const closedSet: Array<PathNode> = [];

    const endNode = this.nodes[end] as PathNode;
    const startNode = this.nodes[start] as PathNode;

    openSet.push(startNode);

    while (openSet.length) {
      // get current node
      let currentIdx = 0;
      let currentNode = openSet[currentIdx];
      openSet.forEach((node, idx) => {
        if (node.f_score < currentNode.f_score) {
          currentNode = node;
          currentIdx = idx;
        }
      });

      // ending case
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        let curr = currentNode;
        const ret = [];
        while (curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        return ret.reverse();
      }

      // move currentNode from open to closed, process each of its neighbors
      openSet.splice(currentIdx, 1);
      closedSet.push(currentNode);
      // console.log(
      //   `x: ${currentNode.x}, y: ${currentNode.y}, z: ${
      //     currentNode.z
      //   } (${String.fromCharCode(currentNode.z + 97)})`
      // );
      const neighbors = this.adjacencies[currentNode.id] as Array<PathNode>;
      for (let index = 0; index < neighbors.length; index++) {
        const neighbor = neighbors[index];
        if (closedSet.includes(neighbor)) continue;

        neighbor.g_score = currentNode.g_score + 1;
        neighbor.h_score = manhattanDistance(neighbor, endNode);
        neighbor.f_score = neighbor.g_score + neighbor.h_score;

        if (!openSet.includes(neighbor)) {
          neighbor.parent = currentNode;
          openSet.push(neighbor);
        } else {
          const existingNeighbor = openSet.find((e) => e === neighbor);
          if (existingNeighbor && neighbor.g_score < existingNeighbor.g_score) {
            existingNeighbor.g_score = neighbor.g_score;
            existingNeighbor.parent = neighbor.parent;
          }
        }
      }
    }

    // throw new Error(`No path to ${endNode} exists!`);
    return [];
  }
}

function getStartEndNodesIds(dataString: string): [number, number] {
  let startNode: number | undefined = undefined;
  let endNode: number | undefined = undefined;
  dataString
    .replace(/\n/g, "")
    .split("")
    .forEach((s, idx) => {
      if (s === "S") startNode = idx;
      if (s === "E") endNode = idx;
    });

  if (startNode === undefined || endNode === undefined) {
    throw new Error("start and/or end node not found!");
  }

  return [startNode, endNode];
}

// function renderPath(path: Array<PathNode>);

async function solve1(filename: string) {
  const data = (await readInput(filename)).trim();
  const heightData = createHeightmap(data);
  const graph = createGraph(heightData);
  const [startNode, endNode] = getStartEndNodesIds(data);
  // console.log([startNode, endNode]);
  const optimalPath = graph.shortestPath(startNode, endNode);
  // console.log(optimalPath);
  console.log(`Solution #1 for ${filename}: ${optimalPath.length}`);
}

function getAllNodeIds(
  height: number,
  heightMap: Array<Array<PathNode>>
): Array<number> {
  const ret: Array<number> = [];
  for (let rowIndex = 0; rowIndex < heightMap.length; rowIndex++) {
    const row = heightMap[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const node = row[colIndex];
      if (node.z === height) ret.push(node.id);
    }
  }
  return ret;
}

async function solve2(filename: string) {
  const data = (await readInput(filename)).trim();
  const heightData = createHeightmap(data);
  const graph = createGraph(heightData);
  // first start node is an S, need to still get it
  const [startNode, endNode] = getStartEndNodesIds(data);
  // add all other a nodes
  const allStartPoints = getAllNodeIds(0, heightData);
  const allPathLengths = allStartPoints.map((start) => {
    const shortestPath = graph.shortestPath(start, endNode);
    // console.log(`startNode: ${start} | length: ${shortestPath.length}`);
    return shortestPath.length ? shortestPath.length : Infinity;
  });
  const shortestPath = allPathLengths.reduce((agg, curr) =>
    agg < curr ? agg : curr
  );
  console.log(`Solution #2 for ${filename}: ${shortestPath}`);
}

solve1("sample.txt");
solve1("input.txt");
solve2("sample.txt");
solve2("input.txt");
