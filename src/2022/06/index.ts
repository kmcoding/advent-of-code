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

async function solveSample() {
  const data = await readInput("sample.txt");

  data.split("\n").forEach((line) => {
    const resultMarker = findMarker(line, 4);
    console.log(resultMarker);
  });
}

async function solve1() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  const resultMarker = findMarker(data, 4);
  console.log(resultMarker);
}

async function solve2() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  // do magic here...
}

// solveSample();
solve1();
// solve2();
