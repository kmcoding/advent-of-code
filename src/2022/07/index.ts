import fs from "fs/promises";

class File {
  fileSize: number;
  fileName: string;

  constructor(fileSize: number, fileName: string) {
    this.fileName = fileName;
    this.fileSize = fileSize;
  }
}

class Directory {
  readonly contents: Map<string, Directory | File>;
  readonly dirName: string;
  readonly parentDir?: Directory;
  private INDENTATION = 2;

  constructor(dirName: string, parentDir: Directory | undefined = undefined) {
    this.contents = new Map();
    this.dirName = dirName;
    this.parentDir = parentDir;
  }

  getDirectory(dirName: string): Directory {
    const dir = this.contents.get(dirName);
    if (!dir || !(dir instanceof Directory)) {
      throw new Error(`directory '${dirName}' does not exist!`);
    }
    return dir;
  }

  addFile(fileName: string, fileSize: number): File {
    const newFile = new File(fileSize, fileName);
    this.contents.set(fileName, newFile);
    return newFile;
  }
  addDirectory(dirName: string): Directory {
    const newDir = new Directory(dirName, this);
    this.contents.set(dirName, newDir);
    return newDir;
  }

  getTotalSize(): number {
    return Array.from(this.contents.values()).reduce((agg, curr) => {
      if (curr instanceof File) {
        return agg + curr.fileSize;
      } else {
        return agg + curr.getTotalSize();
      }
    }, 0);
  }

  getAllDirs(): Array<Directory> {
    const result: Array<Directory> = [];

    result.push(this);

    Array.from(this.contents.values()).forEach((element) => {
      if (element instanceof Directory) {
        result.push(...element.getAllDirs());
      }
    });

    return result;
  }

  // TODO: not working correctly, yet!
  getDirectoriesBelowThreshold(threshold: number): Array<Directory> {
    const result: Array<Directory> = [];

    // first check self
    if (this.getTotalSize() < threshold) {
      result.push(this);
    }

    // then check for each subdirectory recursively
    Array.from(this.contents.values()).forEach((element) => {
      if (element instanceof Directory && element.getTotalSize() < threshold) {
        result.push(...element.getDirectoriesBelowThreshold(threshold));
      }
    });

    return result;
  }

  render(level = 0): string {
    const lines: Array<string> = [];
    const firstpadIndent = "".padStart(level * this.INDENTATION, " ");
    // const fileFormat = "- {0} (file, size={1})";

    // insert the current directory as the first line
    lines.push(
      `${firstpadIndent}- ${
        this.dirName
      } (dir, size=${this.getTotalSize().toString()})`
    );

    // now iterate over this directories' contents
    // and print out each file and directory
    Array.from(this.contents.values()).forEach((element) => {
      const padIndent = "".padStart((level + 1) * this.INDENTATION, " ");
      if (element instanceof File) {
        lines.push(
          `${padIndent}- ${element.fileName} (file, size=${element.fileSize})`
        );
      } else {
        // lines.push(`${padIndent} - ${element.dirName} (dir)`);
        lines.push(element.render(level + 1));
      }
    });

    return lines.join("\n");
  }
}

async function readInput(filename: string) {
  return await fs.readFile(filename, "utf8");
}

function parseCommands(commands: Array<string>, debug = false): Directory {
  const rootDir = new Directory("/");
  let currentDir = rootDir;

  for (let index = 0; index < commands.length; index++) {
    let command = commands[index];
    debug && console.log(`[${index}] Line: ${command}`);
    // parse one command at a time

    if (command.startsWith("$")) {
      // remove leading dollar sign
      command = command.slice(2);
      debug && console.log(`[${index}] Executing command: ${command}`);

      // check for supported commands
      if (command.startsWith("cd")) {
        // perform cd command
        const changeTo = command.split(" ")[1];
        debug && console.log(`[${index}] Executing cd command to: ${changeTo}`);

        if (changeTo === "/") {
          debug && console.log(`[${index}] Changing dir to root dir`);
          // special: change to root if / is specified
          currentDir = rootDir;
        } else if (changeTo === ".." && currentDir.parentDir !== undefined) {
          debug && console.log(`[${index}] Changing dir to parent dir`);
          // change to parent directory
          currentDir = currentDir.parentDir;
        } else if (
          currentDir.contents.has(changeTo) &&
          currentDir.contents.get(changeTo) instanceof Directory
        ) {
          debug && console.log(`[${index}] Changing dir to: ${changeTo}`);
          currentDir = currentDir.contents.get(changeTo) as Directory;
        } else {
          const errMsg = [
            "cannot execute command '",
            command,
            "' on index '",
            index.toString(),
            "'!",
          ].join("");
          throw new Error(errMsg);
        }

        // change to subdirectory
      } else if (command.startsWith("ls")) {
        // perform ls command
      }
    } else if (command.startsWith("dir")) {
      // create a new directory
      // TODO: check if directory already exists
      const dirToCreate = command.split(" ")[1];
      debug &&
        console.log(
          `[${index}] Creating directory '${dirToCreate}' in '${currentDir.dirName}'`
        );
      currentDir.addDirectory(dirToCreate);
    } else {
      // create a new file
      const [fileSize, fileName] = command.split(" ");
      debug &&
        console.log(
          `[${index}] Creating file '${fileName}' in '${currentDir.dirName}'`
        );
      currentDir.addFile(fileName, parseInt(fileSize));
    }
  }

  return rootDir;
}

function solveBelow(
  dataString: string,
  threshold: number,
  debug = false
): number {
  const rootDir = parseCommands(dataString.trim().split("\n"));

  debug && console.log(rootDir.render());
  const allDirs = rootDir.getAllDirs();
  debug && console.log(allDirs.map((e) => e.dirName));
  const filteredDirs = allDirs.filter((dir) => dir.getTotalSize() < threshold);
  debug && console.log(filteredDirs.map((e) => e.dirName));
  const sumDirectories = filteredDirs.reduce(
    (agg, curr) => agg + curr.getTotalSize(),
    0
  );
  return sumDirectories;
}

async function solveSample1() {
  const data = await readInput("sample.txt");
  const sumDirectories = solveBelow(data, 100000);
  console.log(`Solution sample #1: ${sumDirectories}`);
}

async function solve1() {
  const data = await readInput("input.txt");
  const sumDirectories = solveBelow(data, 100000);
  console.log(`Solution #1: ${sumDirectories}`);
}

async function solve2() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const data = await readInput("input.txt");
  const MAX_STORAGE = 70000000;
  const REQUIRED_STORAGE = 30000000;
  const rootDir = parseCommands(data.trim().split("\n"));

  const leftSpace = MAX_STORAGE - rootDir.getTotalSize();
  const allDirs = rootDir.getAllDirs();

  const deltaStorage = REQUIRED_STORAGE - leftSpace;

  let filteredDirs = allDirs.filter(
    (dir) => dir.getTotalSize() >= deltaStorage
  );
  filteredDirs = filteredDirs.sort(
    (a, b) => a.getTotalSize() - b.getTotalSize()
  );
  const finalDir = filteredDirs[0];

  console.log(`Solution #2: ${finalDir.dirName} | ${finalDir.getTotalSize()}`);
}

solveSample1();
solve1();
solve2();
