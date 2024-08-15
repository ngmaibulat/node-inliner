import fs from "node:fs";

export function readFile(path, fsw = fs) {
    return fsw.readFileSync(path, "utf-8");
}
