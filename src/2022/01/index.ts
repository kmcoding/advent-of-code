import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

async function transformInput() {
  const data = await readInput("input.txt");
  const elves = data.split("\n\n");
  const elvesInts: number[] = elves.map((elf) => {
    return elf
      .split("\n")
      .map((elem) => Number(elem))
      .reduce((agg, curr) => agg + curr);
  });
  return elvesInts;
}

async function solve1() {
  const data = await transformInput();
  console.log(`Solution #1: ${Math.max(...data)}`);
}

async function solve2() {
  const data = await transformInput();
  const topThreeElves = data
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((agg, curr) => agg + curr);
  console.log(`Solution #2: ${topThreeElves}`);
}

solve1();
solve2();
