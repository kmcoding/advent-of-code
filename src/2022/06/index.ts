import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

async function solve1() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  // do magic here...
}

async function solve2() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  // do magic here...
}

solve1();
solve2();
