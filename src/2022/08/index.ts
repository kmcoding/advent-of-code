import fs from "fs/promises";

// using colorized console logs to better showcase the solution
// source: https://stackoverflow.com/a/57100519
enum Color {
  Reset = "\x1b[0m",
  Bright = "\x1b[1m",
  Dim = "\x1b[2m",
  Underscore = "\x1b[4m",
  Blink = "\x1b[5m",
  Reverse = "\x1b[7m",
  Hidden = "\x1b[8m",

  FgBlack = "\x1b[30m",
  FgRed = "\x1b[31m",
  FgGreen = "\x1b[32m",
  FgYellow = "\x1b[33m",
  FgBlue = "\x1b[34m",
  FgMagenta = "\x1b[35m",
  FgCyan = "\x1b[36m",
  FgWhite = "\x1b[37m",
  FgGray = "\x1b[90m",

  BgBlack = "\x1b[40m",
  BgRed = "\x1b[41m",
  BgGreen = "\x1b[42m",
  BgYellow = "\x1b[43m",
  BgBlue = "\x1b[44m",
  BgMagenta = "\x1b[45m",
  BgCyan = "\x1b[46m",
  BgWhite = "\x1b[47m",
  BgGray = "\x1b[100m",
}

function colorString(color: Color, str: string) {
  return `${color}${str}${Color.Reset}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function colorLog(color: Color, ...args: any[]) {
  console.log(
    ...args.map((it) => (typeof it === "string" ? colorString(color, it) : it))
  );
}

async function readInput(filename: string) {
  return fs.readFile(filename, "utf8");
}

class Matrix {
  public readonly rows: Array<Array<number>>;
  public readonly cols: Array<Array<number>>;

  constructor(rows: Array<Array<number>> = [[]]) {
    this.rows = rows;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.cols = rows[0].map((_col) => []);
    rows.forEach((row) => {
      row.forEach((col, colIndex) => {
        this.cols[colIndex].push(col);
      });
    });
  }

  print() {
    console.log(this.rows.map((row) => row.join("")).join("\n"));
  }

  printVisible(color: Color = Color.FgYellow) {
    const mask = this.combineColsRowsIndices();
    const toPrint = this.rows
      .map((row, rowIndex) => {
        let rowString = "";
        row.forEach((col, colIndex) => {
          if (mask[rowIndex].includes(colIndex)) {
            rowString += colorString(color, col.toString());
          } else {
            rowString += col.toString();
          }
        });
        return rowString;
      })
      .join("\n");

    console.log(toPrint);
  }

  row(index: number): Array<number> {
    return this.rows[index];
  }
  col(index: number): Array<number> {
    return this.rows.map((row) => {
      return row[index];
    });
  }

  getBestScenicScore(): number {
    const result = this.rows
      .map((row, rowIndex) => {
        return row
          .map((col, colIndex) => {
            return this.getScenicScore(rowIndex, colIndex);
          })
          .reduce((agg, curr) => {
            return agg > curr ? agg : curr;
          });
      })
      .reduce((agg, curr) => {
        return agg > curr ? agg : curr;
      });

    return result;
  }

  getScenicScore(row: number, col: number) {
    type Direction = "up" | "left" | "down" | "right";
    const scenicScores = ["up", "left", "down", "right"].map((dir) => {
      return this.getScenicScoreDirection(row, col, dir as Direction);
    });

    return scenicScores.reduce((agg, curr) => agg * curr);
  }

  getScenicScoreDirection(
    row: number,
    col: number,
    dir: "up" | "left" | "down" | "right"
  ): number {
    let checkArray: Array<number>;

    switch (dir) {
      case "up":
        checkArray = this.col(col)
          .slice(0, row + 1)
          .reverse();
        break;
      case "left":
        checkArray = this.row(row)
          .slice(0, col + 1)
          .reverse();
        break;
      case "down":
        checkArray = this.col(col).slice(row);
        break;
      case "right":
        checkArray = this.row(row).slice(col);
        break;
    }

    if (checkArray.length === 1) return 0;

    let scenicScore = 0;
    const treeHeight = checkArray[0];
    for (let index = 1; index < checkArray.length; index++) {
      const element = checkArray[index];
      scenicScore = index;
      if (element >= treeHeight) {
        break;
      }
    }
    return scenicScore;
  }

  getVisibleCount(): number {
    return this.getTotalCount(this.combineColsRowsIndices());
  }

  getTotalCount(mask: Array<Array<number>>): number {
    return mask.reduce((agg, curr) => {
      return agg + curr.length;
    }, 0);
  }

  combineColsRowsIndices(
    rows: Array<Array<number>> = this.checkRows(),
    cols: Array<Array<number>> = this.checkCols()
  ): Array<Array<number>> {
    const combinedIndices: Array<Array<number>> = rows;
    cols.forEach((col, colIndex) => {
      col.forEach((row) => {
        if (!combinedIndices[row].includes(colIndex)) {
          combinedIndices[row].push(colIndex);
          combinedIndices[row].sort();
        }
      });
    });
    return combinedIndices;
  }

  checkCols(): Array<Array<number>> {
    const allColsChecked = this.cols.map((col) => {
      const checkedRow = this.combineIndices([
        this.getHighestIndices(col),
        this.getHighestIndices(col, true),
      ]);
      return checkedRow.sort();
    });
    return allColsChecked;
  }

  checkRows(): Array<Array<number>> {
    const allRowsChecked = this.rows.map((row) => {
      const checkedRow = this.combineIndices([
        this.getHighestIndices(row),
        this.getHighestIndices(row, true),
      ]);
      return checkedRow.sort();
    });
    return allRowsChecked;
  }

  // checkVector(index: number): Array<number> {
  //   const row = this.rows[index];
  //   const checkedRow = this.combineIndices([
  //     this.getHighestIndices(row),
  //     this.getHighestIndices(row, true),
  //   ]);
  //   return checkedRow.sort();
  // }

  combineIndices(indexArrays: Array<Array<number>>): Array<number> {
    const combined = indexArrays.reduce((agg, curr) => {
      return [...new Set([...agg, ...curr])];
    });
    return combined;
  }

  getHighestIndices(row: Array<number>, reverse = false): Array<number> {
    const indices: Array<number> = [];
    let maxElem = -1;
    if (reverse) {
      for (let index = row.length - 1; index >= 0; index--) {
        const element = row[index];
        if (element > maxElem) {
          maxElem = element;
          indices.push(index);
        }
      }
    } else {
      for (let index = 0; index < row.length; index++) {
        const element = row[index];
        if (element > maxElem) {
          maxElem = element;
          indices.push(index);
        }
      }
    }
    return indices;
  }
}

function parseMatrix(matrixString: string): Matrix {
  const matrixData = matrixString
    .split("\n")
    .map((row) => row.split("").map((col) => parseInt(col)));

  const resultMatrix = new Matrix(matrixData);
  return resultMatrix;
}

async function solveSample1() {
  const data = (await readInput("sample.txt")).trim();
  const matrix = parseMatrix(data);
  // matrix.print();

  const numVisible = matrix.getVisibleCount();
  console.log(`Solution sample #1: ${numVisible}`);
  // matrix.printVisible();
}
async function solve1() {
  const data = (await readInput("input.txt")).trim();
  const matrix = parseMatrix(data);
  // matrix.print();

  const numVisible = matrix.getVisibleCount();
  console.log(`Solution #1: ${numVisible}`);
  // matrix.printVisible();
}

async function solveSample2() {
  const data = (await readInput("sample.txt")).trim();
  const matrix = parseMatrix(data);
  // matrix.print();

  console.log(`Solution sample #2: ${matrix.getBestScenicScore()}`);
}
async function solve2() {
  const data = (await readInput("input.txt")).trim();
  const matrix = parseMatrix(data);

  console.log(`Solution #2: ${matrix.getBestScenicScore()}`);
}

solveSample1();
solve1();
solveSample2();
solve2();
