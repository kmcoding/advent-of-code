import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

type Direction = "R" | "U" | "L" | "D";

type Step = {
  readonly dir: Direction;
  readonly steps: number;
};

type Vector2d = {
  readonly x: number;
  readonly y: number;
};

type SymbolToDraw = Vector2d & { symbol: string };

const MOVE_MAPPING: {
  [Property in Direction]: Vector2d;
} = {
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
  R: { x: 1, y: 0 },
  L: { x: -1, y: 0 },
};

class Knot {
  readonly symbol: "H" | "T";
  readonly parent?: Knot;
  readonly history: Array<Vector2d>;
  pos: Vector2d;

  constructor(symbol: "H" | "T", parent?: Knot, startPos?: Vector2d) {
    this.symbol = symbol;
    this.parent = parent;
    const firstPos = startPos ?? { x: 0, y: 0 };
    this.history = [firstPos];
    this.pos = firstPos;
  }

  getUniqueVisits(): Array<Vector2d> {
    const deduplicated: Array<Vector2d> = [];
    this.history.forEach((vector) => {
      let found = false;
      deduplicated.forEach((elem) => {
        if (vector.x === elem.x && vector.y === elem.y) found = true;
      });
      if (!found) deduplicated.push(vector);
    });

    return deduplicated;
  }

  distanceTo(other: Knot): Vector2d {
    const distance = {
      x: other.pos.x - this.pos.x,
      y: other.pos.y - this.pos.y,
    };
    return distance;
  }

  move(step?: Step) {
    let newPos: Vector2d;
    // check if a step was provided (this may not
    // be the case for dependent Knots as they can
    // depend on their parent Knot's movement)
    if (step === undefined) {
      // when we do not have a parent then simply
      // do not move at all
      if (this.parent === undefined) {
        // ...therefore copy the previous position
        newPos = this.pos;
      } else {
        // we got a parent so move according
        // to specified rules
        const distanceVector = this.distanceTo(this.parent);
        if (Math.abs(distanceVector.x) > 1 || Math.abs(distanceVector.y) > 1) {
          // we need to move!
          const moveVector: Vector2d = {
            x: Math.round(distanceVector.x / 2),
            // the direction of Math.round() is always +∞:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#description
            // Solution to this problem:
            // https://stackoverflow.com/a/71647883
            y:
              distanceVector.y < 0
                ? -Math.round(-(distanceVector.y / 2))
                : Math.round(distanceVector.y / 2),
          };
          newPos = {
            x: this.pos.x + moveVector.x,
            y: this.pos.y + moveVector.y,
          };
        } else {
          newPos = this.pos;
        }
      }
    } else {
      // if we received a step object then move
      // according to that step object's params
      const dirVector = MOVE_MAPPING[step.dir];
      newPos = {
        x: this.pos.x + dirVector.x,
        y: this.pos.y + dirVector.y,
      };
    }
    this.pos = newPos;
    this.history.push(newPos);
  }
}

function freeze(time: number) {
  const stop = new Date().getTime() + time;
  while (new Date().getTime() < stop);
}

class RopeSimulation {
  public actions: Array<Step>;
  public actors: Array<Knot>;
  public actorsRenderOrder: Array<Knot>;
  public finished: boolean;
  public stepIndex: number;
  public centerOffset?: Vector2d;
  public boardDimensions?: Vector2d;

  constructor(actions: Array<Step>);
  constructor(
    actions: Array<Step>,
    centerOffset: Vector2d,
    boardDimensions: Vector2d
  );
  constructor(
    actions: Array<Step>,
    centerOffset?: Vector2d,
    boardDimensions?: Vector2d
  ) {
    this.actions = actions;
    this.stepIndex = 0;
    this.finished = false;

    // initialize the two actors for this puzzle
    const headKnot = new Knot("H");
    const tailKnot = new Knot("T", headKnot);
    this.actors = [headKnot, tailKnot];
    this.actorsRenderOrder = [tailKnot, headKnot];

    this.centerOffset = centerOffset;
    this.boardDimensions = boardDimensions;
    // if (centerOffset !== undefined && boardDimensions !== undefined) {
    //   this.centerOffset = centerOffset;
    //   this.boardDimensions = boardDimensions;
    // }
  }

  private initialize() {
    this.stepIndex = 0;
    this.finished = false;

    // initialize the two actors for this puzzle
    const headKnot = new Knot("H");
    const tailKnot = new Knot("T", headKnot);
    this.actors = [headKnot, tailKnot];
    this.actorsRenderOrder = [tailKnot, headKnot];
  }

  private moveActors(step: Step) {
    this.actors.forEach((actor) => {
      if (actor.parent === undefined) {
        actor.move(step);
      } else {
        actor.move();
      }
    });
  }

  private renderSymbolOnBoard(symbol: SymbolToDraw, board: Array<string>) {
    // replace the specific position with
    // the actor's symbol
    let boardRow = board[board.length - symbol.y - 1];
    boardRow = boardRow
      .split("")
      .map((element, index) => {
        if (index === symbol.x) {
          return symbol.symbol;
        } else {
          return element;
        }
      })
      .join("");

    board[board.length - symbol.y - 1] = boardRow;
  }

  render(clear = true) {
    if (this.centerOffset !== undefined && this.boardDimensions !== undefined) {
      // setup the empty board
      const board: Array<string> = [];
      for (let index = 0; index < this.boardDimensions.y; index++) {
        board.push(".".repeat(this.boardDimensions.x));
      }

      // define symbols to draw on board
      const symbolsToDraw: Array<SymbolToDraw> = [];
      const startOffset = this.centerOffset;

      // render the starting point
      const startSymbol = {
        x: 0 - startOffset.x,
        y: 0 - startOffset.y,
        symbol: "s",
      };
      symbolsToDraw.push(startSymbol);

      // place the actors on the board
      this.actorsRenderOrder.forEach((actor) => {
        symbolsToDraw.push({
          x: actor.pos.x - startOffset.x,
          y: actor.pos.y - startOffset.y,
          symbol: actor.symbol,
        });
      });

      // render all symbols on the board
      symbolsToDraw.forEach((s) => {
        this.renderSymbolOnBoard(s, board);
      });

      // finally create the renderString
      const renderString = board.join("\n");

      // optionally clear screen and
      // print new layout
      if (clear) console.clear();
      console.log(renderString);
    }
  }

  public simulateStep(render = false, sleep?: number, clear?: boolean) {
    // UPDATE LOGIC
    // get the next step action
    const nextStep = this.actions[this.stepIndex];

    if (nextStep.steps > 1) {
      // split up the move object into single step objects
      // and move the actors one step at a time
      for (let index = 0; index < nextStep.steps; index++) {
        this.moveActors({ dir: nextStep.dir, steps: 1 });
        // UPDATE SCREEN
        if (render) {
          if (sleep !== undefined) freeze(sleep);
          this.render(clear ?? true);
        }
      }
    } else {
      // directly move the actors one step
      this.moveActors(nextStep);
      // UPDATE SCREEN
      if (render) {
        if (sleep !== undefined) freeze(sleep);
        this.render(clear ?? true);
      }
    }

    // increment stepIndex by 1 after completion
    this.stepIndex += 1;

    // check if the simulation is finished
    if (this.stepIndex === this.actions.length) {
      this.finished = true;
    }
  }

  simulate(animate = false, sleep?: number, clear?: boolean) {
    // first get the final state of the board
    // to be drawn. Without this information
    // it is not possible to render the full
    // board where the actors will move in
    while (!this.finished) {
      this.simulateStep(false);
    }

    // create the centerOffset value for the
    // start point on the board and create the
    // board dimensions
    if (this.centerOffset === undefined && this.boardDimensions === undefined) {
      let [minBoardX, maxBoardX] = [0, 0];
      let [minBoardY, maxBoardY] = [0, 0];
      this.actors.forEach((actor) => {
        minBoardX = actor.history.reduce((agg, curr) => {
          return agg < curr.x ? agg : curr.x;
        }, minBoardX);
        maxBoardX = actor.history.reduce((agg, curr) => {
          return agg > curr.x ? agg : curr.x;
        }, maxBoardX);
        minBoardY = actor.history.reduce((agg, curr) => {
          return agg < curr.y ? agg : curr.y;
        }, minBoardY);
        maxBoardY = actor.history.reduce((agg, curr) => {
          return agg > curr.y ? agg : curr.y;
        }, maxBoardY);
      });

      const width = maxBoardX - minBoardX + 1;
      const height = maxBoardY - minBoardY + 1;
      const newBoardDimensions = { x: width, y: height };
      const newCenterOffset = { x: minBoardX, y: minBoardY };
      this.boardDimensions = newBoardDimensions;
      this.centerOffset = newCenterOffset;
    }

    // now, depending on the animate parameter,
    // create the animated version
    if (animate) {
      // reset step settings to defaults
      this.initialize();

      // re-run the simulation but now with
      // animations between the steps
      while (!this.finished) {
        this.simulateStep(true, sleep, clear);
      }
    }
  }
}

function parseStepData(stepData: Array<string>): Array<Step> {
  return stepData.map((step) => {
    const [dir, steps] = step.trim().split(" ");
    return { dir: dir as Direction, steps: parseInt(steps) };
  });
}

async function solveSample1() {
  const stepData = (await readInput("sample.txt")).trim().split("\n");
  const parsedSteps = parseStepData(stepData);
  // console.log(parsedSteps);

  const simulation = new RopeSimulation(parsedSteps);
  simulation.simulate(true, 10);
  console.log(simulation.actors[1].getUniqueVisits());
}
async function solve1() {
  const data = await readInput("input.txt");
}

async function solve2() {
  const data = await readInput("input.txt");
}

solveSample1();
// solve1();
// solve2();
