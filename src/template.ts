import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

async function solve1(filename: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput(filename);
  // do magic here...
}

async function solve2(filename: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput(filename);
  // do magic here...
}

solve1("sample.txt");
// solve1("input.txt");
// solve2("sample.txt");
// solve2("input.txt");
