/** @flow */

import * as proc from "child_process";
import * as read from "readline";
import * as fs from "fs";
import type { Error, Unit, Try } from "./types";

export function openURL(url: string): Promise<Error | Unit> {
  return new Promise(resolve => {
    proc.exec(`open "${url}"`, {}, (error, stdout, stderr) => {
      if (error !== null)
        resolve({ error: true, cause: stderr });
      else
        resolve({ success: true });
    });
  });
}

export function readLineFromStdin(): Promise<string> {
  return new Promise(resolve => {
    const rl = read.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on("line", line => {
      rl.close();
      resolve(line.replace(/^\s+|\s+$/g, ""));
    });
  });
}

export function askForInput(description: string): Promise<string> {
  process.stdout.write(description);
  return readLineFromStdin();
}

export function readTextFile(path: string): Promise<Try<?string>> {
  return new Promise(resolve => {
    fs.exists(path, exists => {
      if (!exists)
        resolve({ success: true, value: null });
      else
        fs.readFile(path, "utf8", (err, data) => {
          if (err) resolve({ error: true, cause: err });
          resolve({ success: true, value: data });
        });
    });
  });
}

export function writeTextToFile(path: string, data: string): Promise<Error | Unit> {
  return new Promise(resolve => {
    fs.writeFile(path, data, "utf8", err => {
      if (err) resolve({ error: true, cause: err });
      resolve({ success: true });
    });
  });
}
