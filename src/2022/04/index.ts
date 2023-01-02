import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

type IntervalClosing = "left" | "right" | "both" | "neither";

class Interval {
  readonly min: number;
  readonly max: number;
  readonly mid: number;
  readonly closed: IntervalClosing;

  constructor(min: number, max: number, closed?: IntervalClosing) {
    if (min > max) {
      throw new Error("min may not be greater than max!");
    }

    this.min = min;
    this.max = max;
    this.mid = (max + min) / 2;
    this.closed = max === min ? "both" : closed || "both";
  }

  private leftOverlaps(other: Interval): boolean {
    let leftContained = false;
    if (["left", "both"].includes(this.closed)) {
      // console.log(`this.min=${this.min} | other.min=${other.min}`);
      leftContained = this.min <= other.min;
    } else {
      leftContained = this.min < other.min;
    }
    return leftContained;
  }

  private rightOverlaps(other: Interval): boolean {
    let rightContained = false;
    if (["right", "both"].includes(this.closed)) {
      // console.log(`this.max=${this.max} | other.max=${other.max}`);
      rightContained = this.max >= other.max;
    } else {
      rightContained = this.max > other.max;
    }
    return rightContained;
  }

  overlaps(other: Interval): boolean {
    const leftOverlaps = this.contains(other.min);
    const rightOverlaps = this.contains(other.max);
    return leftOverlaps || rightOverlaps;
  }

  contains(other: Interval): boolean;
  contains(num: number): boolean;
  contains(intervalOrNumber: number | Interval): boolean {
    if (typeof intervalOrNumber === "number") {
      // check for a single number
      const num = intervalOrNumber;
      if (num < this.mid) {
        return ["right", "neither"].includes(this.closed)
          ? num > this.min
          : num >= this.min;
      } else {
        return ["left", "neither"].includes(this.closed)
          ? num < this.max
          : num <= this.max;
      }
    } else {
      // check if other Interval is contained in this
      const other = intervalOrNumber;
      const leftContained = this.leftOverlaps(other);
      const rightContained = this.rightOverlaps(other);
      return leftContained && rightContained;
    }
  }
}

async function solve1() {
  // do magic here...
  const data = await readInput("input.txt")
    .then((fileContents) => fileContents.trim().split("\n"))
    .then((pairs) => pairs.map((pair) => pair.split(",")))
    .then((pairs) =>
      pairs.map((pair) =>
        pair.map((intervalString) => {
          const [min, max] = intervalString.split("-");
          return new Interval(parseInt(min), parseInt(max));
        })
      )
    )
    .then((intervalPairs) =>
      intervalPairs.map((intervalPair) => {
        const [left, right] = intervalPair;
        return (left.contains(right) || right.contains(left) ? 1 : 0) as number;
      })
    );

  console.log(
    `Solution #1: ${data.reduce((agg: number, curr: number) => agg + curr)}`
  );
}
async function solve2() {
  // do magic here...
  const data = await readInput("input.txt")
    .then((fileContents) => fileContents.trim().split("\n"))
    .then((pairs) => pairs.map((pair) => pair.split(",")))
    .then((pairs) =>
      pairs.map((pair) =>
        pair.map((intervalString) => {
          const [min, max] = intervalString.split("-");
          return new Interval(parseInt(min), parseInt(max));
        })
      )
    )
    .then((intervalPairs) =>
      intervalPairs.map((intervalPair) => {
        const [left, right] = intervalPair;
        return (left.overlaps(right) || right.overlaps(left) ? 1 : 0) as number;
      })
    );

  // console.log(data);
  console.log(
    `Solution #2: ${data.reduce((agg: number, curr: number) => agg + curr)}`
  );
}

solve1();
solve2();

// 67-73,66-74
// const ival1 = new Interval(67, 73);
// const ival2 = new Interval(66, 74);
// console.log(ival2.overlaps(ival1));
// console.log(ival1.overlaps(ival2));
// const ival3 = new Interval(1, 5);
// console.log(ival1.contains(5));
// console.log(ival1.contains(6));
// console.log(ival1.contains(7));
// console.log(ival1.contains(ival2));
// console.log(ival1.contains(ival2));
// console.log("\n");
// console.log(ival2.contains(ival1));
