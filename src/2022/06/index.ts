import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

function findMarker(dataStream: string, bufferSize: number): number {
  let marker = bufferSize;

  for (let index = 0; index < dataStream.length - bufferSize; index++) {
    const buffer = dataStream.slice(index, index + bufferSize);
    const duplicates = buffer
      .split("")
      .sort()
      .join("")
      .match(/(.)\1+/g);
    if (duplicates === null) {
      marker += index;
      break;
    }
  }

  return marker;
}

async function solveSample1() {
  const data = await readInput("sample.txt");

  data.split("\n").forEach((line) => {
    const resultMarker = findMarker(line, 4);
    console.log(resultMarker);
  });
}
async function solveSample2() {
  const data = await readInput("sample.txt");

  data.split("\n").forEach((line) => {
    const resultMarker = findMarker(line, 14);
    console.log(resultMarker);
  });
}

async function solve1() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  const resultMarker = findMarker(data, 4);
  console.log(`Solution #1: ${resultMarker}`);
}

async function solve2() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  const resultMarker = findMarker(data, 14);
  console.log(`Solution #2: ${resultMarker}`);
}

// solveSample1();
// solveSample2();
solve1();
solve2();
