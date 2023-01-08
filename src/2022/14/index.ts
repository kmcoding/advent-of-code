import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

type Vector2d = {
  x: number;
  y: number;
};

const ENTRY_POINT: Vector2d = { x: 500, y: 0 };

function freeze(milliseconds: number) {
  const stop = new Date().getTime() + milliseconds;
  while (new Date().getTime() < stop);
}

class Simulation {
  public readonly grid: Array<Array<string>>;
  public readonly width: number;
  public readonly height: number;
  private readonly offsetX: number;

  constructor(rockFormations: Array<Array<Vector2d>>) {
    // find bottom left and right borders of the grid
    // to extract the offset X value
    const [bottomLeft, bottomRight] = this.findGridBorders(rockFormations);
    this.offsetX = bottomLeft.x - 1; // - 1 for abyss!
    this.width = bottomRight.x - bottomLeft.x + 1 + 2; // + 2 for abyss!
    this.height = bottomLeft.y + 1;

    // now create the grid data by tracing the
    // rock formation paths for each rock
    this.grid = this.createGrid(rockFormations);
  }

  getNextSandPosition(unitOfSand: Vector2d): Vector2d | undefined {
    // move down if possible
    if (this.grid[unitOfSand.y + 1][unitOfSand.x - this.offsetX] === ".") {
      return { x: unitOfSand.x, y: unitOfSand.y + 1 };
    } else if (
      this.grid[unitOfSand.y + 1][unitOfSand.x - this.offsetX - 1] === "."
    ) {
      // move diagonal left
      return { x: unitOfSand.x - 1, y: unitOfSand.y + 1 };
    } else if (
      this.grid[unitOfSand.y + 1][unitOfSand.x - this.offsetX + 1] === "."
    ) {
      // move diagonal right
      return { x: unitOfSand.x + 1, y: unitOfSand.y + 1 };
    } else {
      // no possible move, come to rest
      return undefined;
    }
  }

  isInAbyss(pos: Vector2d): boolean {
    if (pos.y === this.height - 1) return true;
    return false;
  }

  simulate(animate = true, sleep = 50): number {
    // initialize counter value
    let unitsOfSand = 0;
    let fallingIntoAbyss = false;
    while (!fallingIntoAbyss) {
      // create unit of sand
      const unitOfSand: Vector2d = {
        x: ENTRY_POINT.x,
        y: ENTRY_POINT.y,
      };
      let previousPos: Vector2d = unitOfSand;

      // add unit of sand to this grid
      this.grid[unitOfSand.y][unitOfSand.x - this.offsetX] = "o";
      // animate && this.render(undefined, sleep);

      let resting = false;
      // let fall down until come to rest
      while (!resting) {
        // check the next movement position
        const nextPos = this.getNextSandPosition(unitOfSand);

        // exit if undefined
        if (nextPos === undefined) {
          resting = true;
          break;
        } else if (this.isInAbyss(nextPos)) {
          fallingIntoAbyss = true;
          break;
        }

        // apply movement of sand to the grid
        this.grid[nextPos.y][nextPos.x - this.offsetX] = "o";
        this.grid[previousPos.y][previousPos.x - this.offsetX] = ".";
        animate && this.render(undefined, sleep);

        // update position of unit of sand for next iteration
        unitOfSand.x = nextPos.x;
        unitOfSand.y = nextPos.y;

        // save old position (for rendering air again next iteration)
        previousPos = nextPos;
      }

      if (fallingIntoAbyss) break;

      unitsOfSand++;
    }
    return unitsOfSand;
  }

  createGrid(rockFormations: Array<Array<Vector2d>>): Array<Array<string>> {
    // initialize the grid with dots (= air)
    const grid: Array<Array<string>> = [];
    for (let index = 0; index < this.height; index++) {
      grid.push(".".repeat(this.width).split(""));
    }
    // this.render(grid);

    // apply rock formations (# = rock)
    rockFormations.forEach((rockSequence) => {
      // console.log(`Doing sequence: ${JSON.stringify(rockSequence)}`);
      let startPos = rockSequence.splice(0, 1)[0];
      grid[startPos.y][startPos.x - this.offsetX] = "#";
      while (rockSequence.length) {
        const targetPos = rockSequence.splice(0, 1)[0];
        // console.log(`Next element: ${JSON.stringify(targetPos)}`);
        const movementPos = { x: startPos.x, y: startPos.y };
        while (movementPos.x !== targetPos.x || movementPos.y !== targetPos.y) {
          // console.log(`Current pos: ${JSON.stringify(movementPos)}`);
          // move 1 field
          if (targetPos.x > movementPos.x) {
            movementPos.x += 1;
          } else if (targetPos.x < movementPos.x) {
            movementPos.x -= 1;
          } else if (targetPos.y > movementPos.y) {
            movementPos.y += 1;
          } else if (targetPos.y < movementPos.y) {
            movementPos.y -= 1;
          }

          // mark current field as rock
          grid[movementPos.y][movementPos.x - this.offsetX] = "#";

          // render if required
          // this.render(grid);
        }
        startPos = targetPos;
      }
    });

    return grid;
  }

  findGridBorders(
    rockFormations: Array<Array<Vector2d>>
  ): [Vector2d, Vector2d] {
    const flattened = ([] as Array<Vector2d>).concat(...rockFormations);
    const bottomLeft: Vector2d = { x: flattened[0].x, y: flattened[0].y };
    const bottomRight: Vector2d = { x: flattened[0].x, y: flattened[0].y };
    flattened.forEach((point) => {
      // find bottom left
      if (point.x < bottomLeft.x) {
        bottomLeft.x = point.x;
      }
      if (point.y > bottomLeft.y) {
        bottomLeft.y = point.y;
        bottomRight.y = point.y;
      }
      // find bottom right
      if (point.x > bottomRight.x) {
        bottomRight.x = point.x;
      }
    });
    return [bottomLeft, bottomRight];
  }

  render(grid?: Array<Array<string>>, sleep = 100, clear = true) {
    if (clear) {
      console.clear();
    } else {
      console.log("\nCurrent grid:");
    }
    freeze(sleep);
    console.log(
      (grid ?? this.grid)
        .map((row, idx) => {
          let joinedRow = row.join("");
          if (idx === 0) {
            // render sand falling point
            joinedRow =
              joinedRow.substring(0, ENTRY_POINT.x - this.offsetX) +
              "+" +
              joinedRow.substring(ENTRY_POINT.x - this.offsetX + 1);
          }
          return joinedRow;
        })
        .join("\n")
    );
  }
}

function parseRow(row: string): Array<Vector2d> {
  return row.split(" -> ").map((e) => {
    const [x, y] = e.split(",");
    return { x: parseInt(x), y: parseInt(y) } as Vector2d;
  });
}

async function solve1(filename: string) {
  const data = (await readInput(filename)).trim();
  const rockFormations = data.split("\n").map((row) => parseRow(row));
  // console.log(rockFormations);

  const simulation = new Simulation(rockFormations);
  // simulation.render();
  const solution = simulation.simulate(false);

  console.log(`Solution #1 for ${filename}: ${solution}`);
}

async function solve2(filename: string) {
  const data = (await readInput(filename)).trim();
  console.log(`Solution #2 for ${filename}: `);
}

solve1("sample.txt");
solve1("input.txt");
// solve2("sample.txt");
// solve2("input.txt");
