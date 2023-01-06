import fs from "fs/promises";

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

type MonkeyItems = Array<number | bigint>;
type NumberAdjustFunction = (n: number | bigint) => number | bigint;
type MonkeyOperation = NumberAdjustFunction;
type MonkeyTest = {
  divisor: number;
} & NumberAdjustFunction;

class Monkey {
  public monkeyMap?: Map<number | bigint, Monkey>;
  public inspections = 0;

  constructor(
    public readonly id: number,
    public readonly items: MonkeyItems,
    public readonly operation: MonkeyOperation,
    public readonly throwTest: MonkeyTest,
    public afterOperationCallback?: NumberAdjustFunction
  ) {}

  setMonkeyMap(m: Map<number | bigint, Monkey>) {
    this.monkeyMap = m;
  }

  receiveItem(item: number | bigint) {
    this.items.push(item);
  }

  inspectNextItem() {
    if (this.items.length) {
      let item: number | bigint = this.items.splice(0, 1)[0];
      item = this.operation(item);
      item = this.afterOperationCallback
        ? this.afterOperationCallback(item)
        : item;
      this.monkeyMap?.get(this.throwTest(item))?.receiveItem(item);
      this.inspections++;
    }
  }

  inspectItems() {
    if (this.monkeyMap) {
      while (this.items.length) {
        this.inspectNextItem();
      }
    }
  }
}
type OperatorString = "*" | "+" | "-" | "/";
const OPERATOR_MAPPING: {
  [Property in OperatorString]: (
    a: number | bigint,
    b: number | bigint
  ) => number | bigint;
} = {
  "*": (a, b) => BigInt(a) * BigInt(b),
  "+": (a, b) => BigInt(a) + BigInt(b),
  "-": (a, b) => BigInt(a) - BigInt(b),
  "/": (a, b) => BigInt(a) / BigInt(b),
};

function extractOperation(opString: string): MonkeyOperation {
  const operationResultString = opString.replace("  Operation: new = ", "");
  const components = operationResultString.split(" ");
  const mathOperation = OPERATOR_MAPPING[components[1] as OperatorString];
  return (old: number | bigint) => {
    const arg1 = components[0] === "old" ? old : parseInt(components[0]);
    const arg2 = components[2] === "old" ? old : parseInt(components[2]);
    return mathOperation(arg1, arg2);
  };
}

function extractItems(itemsString: string): MonkeyItems {
  return itemsString.match(/(\d+)/g)?.map((e) => parseInt(e)) ?? [];
}

function extractTest(testRows: Array<string>): MonkeyTest {
  // extract division test
  const division = parseInt(
    testRows.splice(0, 1)[0].match(/(\d+)/g)?.[0] ?? ""
  );
  const mTrue = parseInt(testRows.splice(0, 1)[0].match(/(\d+)/g)?.[0] ?? "0");
  const mFalse = parseInt(testRows.splice(0, 1)[0].match(/(\d+)/g)?.[0] ?? "0");
  const testFn = (item: number | bigint) => {
    return BigInt(item) % BigInt(division) === BigInt(0) ? mTrue : mFalse;
  };
  testFn.divisor = division;
  return testFn;
}

function extractMonkeys(
  dataString: string,
  afterOpCb?: NumberAdjustFunction
): Map<number | bigint, Monkey> {
  const monkeyStrings = dataString.split("\n\n");
  const parsedMonkeys = monkeyStrings.map((m) => {
    const lines = m.split("\n");
    // extract monkey ID
    const matchedId = lines.splice(0, 1)[0].match(/(\d{1})/)?.[0] ?? "";
    const monkeyId = matchedId ? parseInt(matchedId[0]) : 0;

    // extract starting items
    const monkeyItems: MonkeyItems = extractItems(lines.splice(0, 1)[0]);

    // extract operation
    const monkeyOperation = extractOperation(lines.splice(0, 1)[0]);

    // extract test
    const monkeyTest = extractTest(lines);

    // create new Monkey object and return
    return new Monkey(
      monkeyId,
      monkeyItems,
      monkeyOperation,
      monkeyTest,
      afterOpCb
    );
  });

  // setup return map
  const monkeyMap = new Map<number | bigint, Monkey>();
  parsedMonkeys.forEach((m) => monkeyMap.set(m.id, m));
  parsedMonkeys.forEach((m) => m.setMonkeyMap(monkeyMap));
  return monkeyMap;
}

class RoundSimulator {
  public round = 0;
  constructor(public readonly monkeyMap: Map<number | bigint, Monkey>) {}

  step() {
    for (let index = 0; index < this.monkeyMap.size; index++) {
      const monkey = this.monkeyMap.get(index);
      monkey?.inspectItems();
    }
    this.round++;
  }

  simulate(rounds = 1) {
    for (let index = 0; index < rounds; index++) {
      this.step();
    }
  }

  render(clear = true) {
    const monkeys = Array.from(this.monkeyMap.values()).sort(
      (a, b) => a.id - b.id
    );
    const renderString = monkeys.map((m) => {
      return `Monkey ${m.id}: ` + m.items.map((i) => i.toString()).join(", ");
    });
    clear && console.clear();
    console.log(`Items at round ${this.round}:`);
    console.log(renderString.join("\n"));
  }

  printInspections() {
    const monkeys = Array.from(this.monkeyMap.values()).sort(
      (a, b) => a.id - b.id
    );
    const renderString = monkeys.map((m) => {
      return (
        `Monkey ${m.id} inspected items ` + m.inspections.toString() + " times."
      );
    });
    console.log(renderString.join("\n"));
  }

  getMonkeyBusiness(): number {
    const twoMostActive = Array.from(this.monkeyMap.values())
      .map((m) => m.inspections)
      .sort((a, b) => b - a)
      .slice(0, 2);
    // console.log(twoMostActive);
    return twoMostActive.reduce((agg, curr) => agg * curr);
  }
}

async function solve1(filename: string) {
  const data = (await readInput(filename)).trim();
  const worryLevelDecrease = (l: number | bigint) => {
    if (typeof l === "bigint") {
      return l / BigInt(3);
    } else {
      return Math.floor(l / 3);
    }
  };
  const monkeys = extractMonkeys(data, worryLevelDecrease);
  const simulation = new RoundSimulator(monkeys);
  console.log("#".repeat(30));
  console.log(`Part 1: ${filename}`);
  simulation.simulate(20);
  simulation.render(false);
  console.log("-".repeat(30));
  simulation.printInspections();
  const solution = simulation.getMonkeyBusiness();

  console.log(`Solution #1 for ${filename}: ${solution}`);
}

async function solve2(filename: string) {
  const data = await readInput(filename);
  const monkeys = extractMonkeys(data);
  const MOD = BigInt(
    Array.from(monkeys.values())
      .map((m) => m.throwTest["divisor"])
      .reduce((agg, curr) => agg * curr)
  );
  monkeys.forEach((m) => (m.afterOperationCallback = (n) => BigInt(n) % MOD));
  const simulation = new RoundSimulator(monkeys);
  console.log("#".repeat(30));
  console.log(`Part 2: ${filename}`);
  simulation.simulate(10000);
  simulation.render(false);
  console.log("-".repeat(30));
  simulation.printInspections();
  const solution = simulation.getMonkeyBusiness();

  console.log(`Solution #2 for ${filename}: ${solution}`);
}

solve1("sample.txt");
solve1("input.txt");
solve2("sample.txt");
solve2("input.txt");
