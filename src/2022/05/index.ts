import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

interface MoveAction {
  from: number;
  to: number;
}
interface MoveAction9001 {
  amount: number;
  from: number;
  to: number;
}

function parseMoveString(moveString: string): MoveAction[] {
  const [, amount, , from, , to] = moveString.split(" ");
  const returnArray: Array<MoveAction> = [];
  for (let index = 0; index < parseInt(amount); index++) {
    const newMoveAction: MoveAction = {
      from: parseInt(from) - 1,
      to: parseInt(to) - 1,
    };

    returnArray.push(newMoveAction);
  }
  return returnArray;
}
function parseMoveString9001(moveString: string): MoveAction9001[] {
  const [, amount, , from, , to] = moveString.split(" ");
  const returnArray: Array<MoveAction9001> = [];
  const newMoveAction: MoveAction9001 = {
    amount: parseInt(amount),
    from: parseInt(from) - 1,
    to: parseInt(to) - 1,
  };

  returnArray.push(newMoveAction);
  return returnArray;
}

function parseCompleteMoveData(moveData: string): MoveAction[] {
  const moves = moveData
    .split("\n")
    .map((moveString) => parseMoveString(moveString))
    .reduce((acc, curr) => acc.concat(curr), []);
  return moves;
}
function parseCompleteMoveData9001(moveData: string): MoveAction9001[] {
  const moves = moveData
    .trim()
    .split("\n")
    .map((moveString) => parseMoveString9001(moveString))
    .reduce((acc, curr) => acc.concat(curr), []);
  return moves;
}

interface State {
  stacks: string[][];
}

function setupInitialState(setupString: string): State {
  const rowResult = setupString.split("\n");
  rowResult.splice(rowResult.length - 1);
  // console.log(rowResult);
  const result = rowResult.map((row) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    row.match(/(.{1,4})/g)!.map((col) => col.trim())
  );
  result.reverse();
  // console.log(result);

  const numCrates = result.length;
  const numStacks = result[0].length;
  const stacks: string[][] = [];
  for (let stack = 0; stack < numStacks; stack++) {
    const currentStack: string[] = [];
    for (let crate = 0; crate < numCrates; crate++) {
      const currentCrate = result[crate][stack];
      if (currentCrate !== "") {
        currentStack.push(currentCrate);
      }
    }
    stacks.push(currentStack);
  }
  return { stacks: stacks };
}

function freeze(time: number) {
  const stop = new Date().getTime() + time;
  while (new Date().getTime() < stop);
}

function applyMoveAction(
  state: State,
  action: MoveAction,
  onAfterMove?: CallableFunction
): State {
  const crateToMove = state.stacks[action.from].pop();
  if (crateToMove === undefined) {
    throw new Error(
      `stack at position ${action.from + 1} has no crate to move! ${state}`
    );
  }
  state.stacks[action.to].push(crateToMove);
  if (onAfterMove !== undefined) {
    freeze(200);
    onAfterMove(state);
  }
  return state;
}
function applyMoveAction9001(
  state: State,
  action: MoveAction9001,
  onAfterMove?: CallableFunction
): State {
  const stack = state.stacks[action.from];
  const cratesToMove = state.stacks[action.from].splice(
    stack.length - action.amount,
    action.amount
  );
  if (cratesToMove.some((elem) => elem === undefined)) {
    throw new Error(
      `stack at position ${action.from + 1} does not have ${
        action.amount
      } crate(s) to move! ${state}`
    );
  }
  state.stacks[action.to].push(...cratesToMove);
  if (onAfterMove !== undefined) {
    freeze(100);
    onAfterMove(state);
  }
  return state;
}

function renderState(state: State) {
  const maxCrates = Math.max(...state.stacks.map((stack) => stack.length));
  const rows: string[] = [];
  for (let crate = maxCrates - 1; crate >= 0; crate--) {
    const row = state.stacks.map((stack) => stack.at(crate) || "   ");
    rows.push(row.join(" "));
  }
  // rows.reverse();
  rows.push(
    [...Array(state.stacks.length).keys()]
      .map((stack) => ` ${stack + 1} `)
      .join(" ")
  );

  const finalRenderString = rows.join("\n");
  console.log(finalRenderString);
}

async function solve(fileName: string, animate = false) {
  const data = await readInput(fileName);
  const [setupString, movesString] = data.split("\n\n");
  const moves = parseCompleteMoveData(movesString);
  // console.log(moves);
  const initialState = setupInitialState(setupString);
  // console.log(initialState);
  const finalState = moves.reduce(
    (acc, curr) =>
      applyMoveAction(
        acc,
        curr,
        animate
          ? (state: State) => {
              console.clear();
              renderState(state);
            }
          : undefined
      ),
    initialState
  );
  // console.log(finalState);
  console.clear();
  renderState(finalState);

  console.log(
    finalState.stacks
      .map((stack) => stack.at(-1)?.replaceAll(/[[\]]/gi, ""))
      .join("")
  );
}
async function solve9001(fileName: string, animate = false) {
  const data = await readInput(fileName);
  const [setupString, movesString] = data.split("\n\n");
  const moves = parseCompleteMoveData9001(movesString);
  // console.log(moves);
  const initialState = setupInitialState(setupString);
  // console.log(initialState);
  const finalState = moves.reduce(
    (acc, curr) =>
      applyMoveAction9001(
        acc,
        curr,
        animate
          ? (state: State) => {
              console.clear();
              renderState(state);
            }
          : undefined
      ),
    initialState
  );
  console.clear();
  renderState(finalState);

  console.log(
    finalState.stacks
      .map((stack) => stack.at(-1)?.replaceAll(/[[\]]/gi, ""))
      .join("")
  );
}

async function sample() {
  // do magic here...
  await solve("sample.txt");
}
async function sample2() {
  // do magic here...
  await solve9001("sample.txt");
}
async function solve1() {
  // do magic here...
  await solve("input.txt");
}
async function solve2(animate = false) {
  // do magic here...
  await solve9001("input.txt", animate);
}

// solve1();
solve2();
// sample2();

// console.log(parseMoveString("move 3 from 1 to 3"));
