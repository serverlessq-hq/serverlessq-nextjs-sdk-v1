import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from "fs/promises";
import { createHash } from "crypto";
import { parseFile, ParseFileResponse } from "./utils/parser";

export class SlsqDetector {
  private watcher: chokidar.FSWatcher;
  private ready = false;
  private cwd = process.cwd();
  private hashTable: Map<string, string> = new Map();

  constructor(
    private isProduction: boolean
  ) {

    this.watcher = chokidar.watch(["**/api/**/*.{ts,js}"], {
      ignored: ["node_modules", "**/node_modules", ".next/**"],
      cwd: this.cwd,
      awaitWriteFinish: true // should prevent events from firing twice
    });

    this.watcher.on("add", this.on("added"));
    this.watcher.on("change", this.on("changed"));
    this.watcher.on("unlink", this.on("deleted"));
    this.watcher.on("ready", () => {
      this.ready = true;
    });
  }

  public async close() {
    await this.watcher.close();
  }

  public async awaitReady() {
    if (this.ready) {
      return;
    }

    await new Promise((resolve) => {
      this.watcher.on("ready", resolve);
    });
  }

  private async onDeleted(params: ParseFileResponse) {
    if(params.type === 'cron') {
      console.log('deleting cron', params.options)
    }
    if(params.type === 'queue') {
        console.log('deleting queue', params.options)
    }
  }

  private async onChanged(params: ParseFileResponse) {
      if(params.type === 'cron') {
        console.log('changing cron', params.options)
      }
      if(params.type === 'queue') {
          console.log('changing queue', params.options)
      }
  }

  private on(fileChangeType: "changed" | "deleted" | "added") {
    return async (filePath: string) => {
      const currentRouteHash = this.hashTable.get(filePath)
      const contents = await fs.readFile(path.join(this.cwd, filePath), "utf-8");
      const slsqConfig = parseFile({ file: contents, isProduction: this.isProduction })

      if (currentRouteHash === this.toHash(contents)) {
        return; // no change
      }
      if (!slsqConfig) return;

      switch (fileChangeType) {
        case "changed":
        case "added": {
          // no route means this is the first time we're seeing this file
          if (!currentRouteHash) {
            this.hashTable.set(filePath, this.toHash(contents))
            return await this.onChanged(slsqConfig);
          }
          break;
        }

        case "deleted": {
          if (currentRouteHash) {
            await this.onDeleted(slsqConfig);
            this.hashTable.delete(filePath)
          }
          break;
        }

        default:
          throw new Error(`Unknown file change type: ${fileChangeType}`);
      }
    }
  }

  private toHash(str: string) {
    const buffer = Buffer.from(str, 'utf-8');
    return createHash('sha256').update(buffer).digest('hex')
  }
}
