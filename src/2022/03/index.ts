import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

function commonItem(compartments: string[]): string {
  const [firstCompartment, ...otherCompartments] = compartments;

  let common = "";
  for (const char of [...firstCompartment]) {
    if (otherCompartments.every((compartment) => compartment.includes(char))) {
      common = char;
      break;
    }
  }
  return common;
}

async function solve1() {
  // do magic here...
  const LOWER_SUBTRACT = 96;
  const UPPER_SUBTRACT = 38;
  const priorityList = await readInput("input.txt")
    .then((fileContent) => fileContent.trim())
    .then((fileContent) => fileContent.split("\n"))
    .then((fileContent) =>
      fileContent.map((rucksack) => {
        return [
          rucksack.substring(0, rucksack.length / 2),
          rucksack.substring(rucksack.length / 2),
        ];
      })
    )
    .then((rucksacks) => rucksacks.map(commonItem))
    .then((commonCharList) =>
      commonCharList.map((char) => {
        let charCode = char.charCodeAt(0);
        charCode =
          charCode -
          (char === char.toLowerCase() ? LOWER_SUBTRACT : UPPER_SUBTRACT);
        return charCode;
      })
    );

  const result = priorityList.reduce((agg, curr) => agg + curr);

  console.log(`Solution #1: ${result}`);
}
async function solve2() {
  // do magic here...
  const LOWER_SUBTRACT = 96;
  const UPPER_SUBTRACT = 38;

  const ELF_GROUPS = 3;

  const priorityList = await readInput("input.txt")
    .then((fileContent) => fileContent.trim())
    .then((fileContent) => fileContent.split("\n"))
    // .then((fileContent) =>
    //   fileContent.map((rucksack) => {
    //     return [
    //       rucksack.substring(0, rucksack.length / 2),
    //       rucksack.substring(rucksack.length / 2),
    //     ];
    //   })
    // )
    .then((elves) =>
      elves.reduce((returnArray: string[][], element, index) => {
        const ch = Math.floor(index / ELF_GROUPS);
        returnArray[ch] = ([] as string[]).concat(
          returnArray[ch] || ([] as string[]),
          element
        );
        return returnArray;
      }, [] as string[][])
    )
    .then((rucksacks) => rucksacks.map(commonItem))
    .then((commonCharList) =>
      commonCharList.map((char) => {
        let charCode = char.charCodeAt(0);
        charCode =
          charCode -
          (char === char.toLowerCase() ? LOWER_SUBTRACT : UPPER_SUBTRACT);
        return charCode;
      })
    );
  // console.log(priorityList);

  const result = priorityList.reduce((agg, curr) => agg + curr);

  console.log(`Solution #2: ${result}`);
}

solve1();
solve2();
