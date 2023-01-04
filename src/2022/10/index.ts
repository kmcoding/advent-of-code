import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

function freeze(time: number) {
  const stop = new Date().getTime() + time;
  while (new Date().getTime() < stop);
}

async function solveSample1() {
  const data = (await readInput("sample.txt")).trim();
  const commands = data.split("\n");
  const X: Array<number> = [1];
  commands.forEach((command) => {
    if (command.trim() === "noop") {
      X.push(X[X.length - 1]);
    } else {
      const V = parseInt(command.split(" ")[1]);
      X.push(X[X.length - 1]);
      X.push(X[X.length - 1] + V);
    }
  });
  // console.log(X);
  const signalStrengths = X.map((elem, index) => {
    return elem * (index + 1);
  });
  // console.log(signalStrengths);
  const cyclesToLog = [20, 60, 100, 140, 180, 220];
  const signalMap = new Map<number, number>();
  cyclesToLog.forEach((cycle) => {
    signalMap.set(cycle, signalStrengths[cycle - 1]);
  });
  // console.log(signalMap);
  const sumSignalStrengths = Array.from(signalMap.values()).reduce(
    (agg, curr) => {
      return agg + curr;
    }
  );
  console.log(`Solution sample #1: ${sumSignalStrengths}`);
}

async function solve1() {
  const data = (await readInput("input.txt")).trim();
  const commands = data.split("\n");
  const X: Array<number> = [1];
  commands.forEach((command) => {
    if (command.trim() === "noop") {
      X.push(X[X.length - 1]);
    } else {
      const V = parseInt(command.split(" ")[1]);
      X.push(X[X.length - 1]);
      X.push(X[X.length - 1] + V);
    }
  });
  // console.log(X);
  const signalStrengths = X.map((elem, index) => {
    return elem * (index + 1);
  });
  // console.log(signalStrengths);
  const cyclesToLog = [20, 60, 100, 140, 180, 220];
  const signalMap = new Map<number, number>();
  cyclesToLog.forEach((cycle) => {
    signalMap.set(cycle, signalStrengths[cycle - 1]);
  });
  // console.log(signalMap);
  const sumSignalStrengths = Array.from(signalMap.values()).reduce(
    (agg, curr) => {
      return agg + curr;
    }
  );
  console.log(`Solution #1: ${sumSignalStrengths}`);
}

async function solveSample2(animate = false) {
  const data = (await readInput("sample.txt")).trim();
  const commands = data.split("\n");
  const X: Array<number> = [1];
  commands.forEach((command) => {
    if (command.trim() === "noop") {
      X.push(X[X.length - 1]);
    } else {
      const V = parseInt(command.split(" ")[1]);
      X.push(X[X.length - 1]);
      X.push(X[X.length - 1] + V);
    }
  });
  // console.log(X);

  const CRT = [
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
  ];
  X.forEach((x, cycle) => {
    // x is the value of the register DURING a cycle
    // CRT draws a pixel DURING each cycle
    // sprite is three pixels wide: ###
    // sprite is always positioned at x
    const drawPos = cycle % 40;
    const row = Math.floor(cycle / 40);

    if ([x - 1, x, x + 1].includes(drawPos)) {
      CRT[row][drawPos] = "#";
    }
    if (animate) {
      console.clear();
      console.log(CRT.map((row) => row.join("")).join("\n"));
      freeze(50);
    }
  });
  if (!animate) {
    console.log("Solution sample #2:");
    console.log(CRT.map((row) => row.join("")).join("\n"));
  }
}
async function solve2(animate = false) {
  const data = (await readInput("input.txt")).trim();
  const commands = data.split("\n");
  const X: Array<number> = [1];
  commands.forEach((command) => {
    if (command.trim() === "noop") {
      X.push(X[X.length - 1]);
    } else {
      const V = parseInt(command.split(" ")[1]);
      X.push(X[X.length - 1]);
      X.push(X[X.length - 1] + V);
    }
  });
  // console.log(X);

  const CRT = [
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
    ".".repeat(40).split(""),
  ];
  X.forEach((x, cycle) => {
    // x is the value of the register DURING a cycle
    // CRT draws a pixel DURING each cycle
    // sprite is three pixels wide: ###
    // sprite is always positioned at x
    const drawPos = cycle % 40;
    const row = Math.floor(cycle / 40);

    if ([x - 1, x, x + 1].includes(drawPos)) {
      CRT[row][drawPos] = "#";
    }
    if (animate) {
      console.clear();
      console.log(CRT.map((row) => row.join("")).join("\n"));
      freeze(50);
    }
  });
  if (!animate) {
    console.log("Solution #2:");
    console.log(CRT.map((row) => row.join("")).join("\n"));
  }
}

solveSample1();
solve1();
solveSample2();
solve2();
