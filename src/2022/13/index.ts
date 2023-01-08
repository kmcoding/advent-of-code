import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

// recursive types:
// https://stackoverflow.com/a/60722301
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#more-recursive-type-aliases
type ValueOrArray<T> = Array<T> | Array<ValueOrArray<T>>;

type Pair = {
  left?: ValueOrArray<number> | number;
  right?: ValueOrArray<number> | number;
};

function compare(
  pair: Pair,
  indentLevel = 0,
  debug = false
): boolean | undefined {
  // console.dir(pair);
  let { left, right } = pair;
  const tabs = "  ".repeat(indentLevel) + "- ";

  debug &&
    console.log(
      `${tabs}Comparing: ${JSON.stringify(left)} and ${JSON.stringify(right)}`
    );

  if (left === undefined) {
    debug &&
      console.log(
        `  ${tabs}Left side ran out of items, so inputs are in the right order`
      );
    return true;
  }
  if (right === undefined) {
    debug &&
      console.log(
        `  ${tabs}Right side ran out of items, so inputs are not in the right order`
      );
    return false;
  }

  if (typeof left === "number" && typeof right === "number") {
    if (left < right) {
      debug &&
        console.log(
          `  ${tabs}Left side is smaller so inputs are in the right order`
        );
      return true;
    } else if (left > right) {
      debug &&
        console.log(
          `  ${tabs}Right side is smaller so inputs are not in the right oder`
        );
      return false;
    } else {
      // console.log("left === right");
      return undefined;
    }
  }
  if (typeof left === "number" && Array.isArray(right)) {
    // console.log(`${tabs}converting left to array`);
    left = [left];
  }
  if (typeof right === "number" && Array.isArray(left)) {
    // console.log(`${tabs}converting left to array`);
    right = [right];
  }

  // left and right are both lists
  // iterate through both lists and compare
  // all numbers
  if (Array.isArray(left) && Array.isArray(right)) {
    // console.log(
    //   `${tabs}left array: ${JSON.stringify(
    //     left
    //   )} | right array: ${JSON.stringify(right)}`
    // );
    // left = left as Array<ValueOrArray<number>>;
    // right = right as Array<ValueOrArray<number>>;
    const iterLength = [left.length, right.length].reduce((agg, curr) =>
      agg > curr ? agg : curr
    );
    // console.log(`Iterating: ${iterLength}`);
    const allResults: Array<boolean | undefined> = [];
    for (let index = 0; index < iterLength; index++) {
      // console.log(`Iteration #${index}`);
      const leftElement = left[index];
      const rightElement = right[index];
      const result = compare(
        { left: leftElement, right: rightElement },
        indentLevel + 1
      );
      allResults.push(result);
      if (typeof result === "boolean") {
        // console.log(`${tabs}On iteration ${index} got: ${result}!`);
        break;
      }
    }
    // console.log(`Results: ${allResults}`);
    if (allResults.every((e) => e === undefined)) return undefined;
    return allResults.includes(true);
  }
}

async function solve1(filename: string) {
  const data = (await readInput(filename)).trim();
  // console.log(data);
  const pairs = data.split("\n\n");
  // console.log(pairs);
  const createdPairs = pairs.map((p) => {
    const [left, right] = p.split("\n");
    const pair: Pair = {
      left: JSON.parse(left),
      right: JSON.parse(right),
    };
    return pair;
  });
  const allResults = createdPairs.map((pair) => {
    // console.log("#".repeat(35));
    return compare(pair);
  });
  const trueIndices = allResults
    .map((e, i) => {
      return e === true ? i + 1 : undefined;
    })
    .filter((e) => e !== undefined);
  // console.log(trueIndices);
  const solution = (trueIndices as Array<number>).reduce(
    (agg, curr) => agg + curr
  );
  console.log(`Solution #1 for ${filename}: ${solution} `);
}

async function solve2(filename: string) {
  const data = (await readInput(filename)).trim();
  // console.log(data);
  const packetsString =
    "[" + data.replace(/\n\n/g, ",").replace(/\n/g, ",") + ",[[2]],[[6]]" + "]";
  // console.log(JSON.stringify(pairs));
  const allPackets: Array<ValueOrArray<number>> = JSON.parse(packetsString);
  // console.log(allPackets);
  allPackets.sort((left, right) =>
    compare({ left, right }) === true ? -1 : 1
  );
  const sortedPackets = allPackets.map((e, idx) => {
    return {
      [idx + 1]: e,
    };
  });
  // console.dir(sortedPackets, { depth: 3 });

  const filteredPackets = sortedPackets.filter((packet, idx) => {
    const stringifiedPAcket = JSON.stringify(packet[idx + 1]);
    if (stringifiedPAcket === "[[2]]" || stringifiedPAcket === "[[6]]")
      return true;
    return false;
  });
  const solution = filteredPackets
    .map((e) => parseInt(Object.keys(e)[0]))
    .reduce((agg, curr) => agg * curr);
  console.log(`Solution #2 for ${filename}: ${solution} `);
}

solve1("sample.txt");
solve1("input.txt");
solve2("sample.txt");
solve2("input.txt");
