import fs from "fs/promises";

type Vector2d = {
  x: number;
  y: number;
};

type SensorBeaconPair = {
  sensor: Vector2d;
  beacon: Vector2d;
};

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

function parseRow(row: string): SensorBeaconPair {
  const matches = row.match(/x=(.+), y=(.+):.*x=(.*), y=(.*)/);
  // console.log(matches);
  const sensor = {
    x: parseInt(matches?.[1] ?? "0"),
    y: parseInt(matches?.[2] ?? "0"),
  };
  const beacon = {
    x: parseInt(matches?.[3] ?? "0"),
    y: parseInt(matches?.[4] ?? "0"),
  };
  const pair = { sensor, beacon };
  // console.log(pair);
  return pair;
}

function overlapping(
  manhattanDistanceToClosest: number,
  orthogonalDistanceToTarget: number
): number {
  // 1.988.710, |3.861.189 - 2.000.000| = 1.861.189
  if (orthogonalDistanceToTarget > manhattanDistanceToClosest) return 0;

  // |1.988.710 - 1.861.189| = 127.521

  return (manhattanDistanceToClosest - orthogonalDistanceToTarget) * 2 + 1;
}

function manhattanDistance(from: Vector2d, to: Vector2d): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}

type OverlappingRow = {
  from: number;
  to: number;
};

async function solve1(filename: string, TARGET_ROW: number) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = (await readInput(filename)).trim();
  const sensorData = data.split("\n").map((row) => parseRow(row));
  const beacons: Array<Vector2d> = [];
  sensorData.forEach((p) => {
    if (!beacons.some((b) => b.x === p.beacon.x && b.y === p.beacon.y))
      beacons.push(p.beacon);
  });

  // contains a list of all relevant beacons to check
  const relevantBeacons = beacons.filter((b) => b.y === TARGET_ROW);
  // console.log(relevantBeacons);

  // create from-to pairs overlapping intervals
  const overlappingData: Array<OverlappingRow> = sensorData
    .map((s) => {
      const manhDist = manhattanDistance(s.sensor, s.beacon);
      // console.log(manhDist);
      const orthDist = Math.abs(TARGET_ROW - s.sensor.y);
      // console.log(orthDist);
      const overlappingCount = overlapping(manhDist, orthDist);
      if (overlappingCount === 0) return undefined;

      const outwardDist = (overlappingCount - 1) / 2;

      return { from: s.sensor.x - outwardDist, to: s.sensor.x + outwardDist };
    })
    .filter((item): item is OverlappingRow => Boolean(item));
  overlappingData.sort((a, b) => a.from - b.from);

  // check all beacons
  // const checkedBeacons: Array<Vector2d> =  []

  // iterate over the overlapping intervals and check
  // if a beacon is in the current interval
  let solution = 0;
  let rowCounter = overlappingData[0].from - 1;
  overlappingData.forEach((interval) => {
    if (rowCounter < interval.to) {
      const from = rowCounter < interval.from ? interval.from : rowCounter;
      const amount = interval.to - from + 1;
      solution += amount;
      // console.log(
      //   `from ${from} to ${interval.to} = ${amount} | current solution: ${solution}`
      // );
      if (relevantBeacons.length) {
        const toDeleteIds: Array<number> = [];
        // find ID's in relevantBeacons and subtract solution when
        // a beacon is found in the current interval
        relevantBeacons.forEach((b, idx) => {
          if (b.x >= interval.from && b.x <= interval.to) {
            toDeleteIds.push(idx);
            solution -= 1;
            // console.log(
            //   `removing beacon: ${b} | current solution: ${solution}`
            // );
          }
        });
        // remove found ID's from relevantBeacons
        toDeleteIds
          .sort((a, b) => b - a)
          .forEach((id) => relevantBeacons.splice(id, 1));
      }
      rowCounter = interval.to + 1;
    }
  });

  // console.log(overlappingData);
  console.log(`Solution #1 for ${filename}: ${solution}`);
}

async function solve2(filename: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = (await readInput(filename)).trim();
  // console.log(`Solution #2 for ${filename}: ${solution}`);
}

solve1("sample.txt", 10);
solve1("input.txt", 2000000);
// solve2("sample.txt");
// solve2("input.txt");

// const s1: Vector2d = { x: 8, y: 7 };
// const b1: Vector2d = { x: 2, y: 10 };

// console.log(overlapping(manhattanDistance(s1, b1), Math.abs(s1.y - 10)));
