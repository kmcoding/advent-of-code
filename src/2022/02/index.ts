import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

async function transformInput() {
  const data = await readInput("input.txt");
  const moveMapping: { [id: string]: number } = {
    A: 0, // ROCK
    B: 1, // PAPER
    C: 2, // SCISSORS
    X: 0, // ROCK
    Y: 1, // PAPER
    Z: 2, // SCISSORS
  };
  const moveOutcomes = new Proxy([3, 0, 6], {
    get(target: number[], prop: string) {
      let idx = parseInt(prop, 10);
      if (idx < 0) {
        idx += target.length;
      }
      return target[idx];
    },
  });
  const shapeScores = [1, 2, 3];

  const moves = data.split("\n");
  const movesPoints = moves.map((move) => {
    const [opp, me] = move.split(" ");
    const oppIdx = moveMapping[opp];
    const meIdx = moveMapping[me];

    const roundScore = moveOutcomes[-(meIdx - oppIdx)];
    const shapeScore = shapeScores[meIdx];

    const score = roundScore + shapeScore;

    return isNaN(score) ? 0 : score;
  });
  return movesPoints;
}

async function transformInput2() {
  const data = await readInput("input.txt");
  const moveMapping: { [id: string]: number } = {
    A: 0, // ROCK
    B: 1, // PAPER
    C: 2, // SCISSORS
    X: 2, // need to lose
    Y: 0, // draw
    Z: 1, // need to win
  };
  const moveOutcomes = new Proxy([3, 0, 6], {
    get(target: number[], prop: string) {
      let idx = parseInt(prop, 10);
      if (idx < 0) {
        idx += target.length;
      }
      return target[idx];
    },
  });
  const shapeScores = [1, 2, 3];

  const moves = data.split("\n");
  const movesPoints = moves.map((move) => {
    const [opp, me] = move.split(" ");
    const oppIdx = moveMapping[opp];
    const meIdx = moveMapping[me];
    const myChoice = (meIdx + oppIdx) % 3;

    const roundScore = moveOutcomes[-(myChoice - oppIdx)];
    const shapeScore = shapeScores[myChoice];

    const score = roundScore + shapeScore;

    return isNaN(score) ? 0 : score;
  });
  return movesPoints;
}

async function solve1() {
  const data = await transformInput();
  console.log(`Solution #1: ${data.reduce((agg, curr) => agg + curr)}`);
}

async function solve2() {
  const data = await transformInput2();
  console.log(`Solution #2: ${data.reduce((agg, curr) => agg + curr)}`);
}

solve1();
solve2();
