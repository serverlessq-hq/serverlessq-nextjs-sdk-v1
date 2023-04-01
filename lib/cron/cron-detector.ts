import * as chokidar from "chokidar";
import * as path from "path";
import * as fs from "fs";
import { createHash } from "crypto";

export interface DetectedCronJob {
    route: string;
    schedule: string;
    timezone: string;
    framework: string;
    isValid: boolean;
  }

export class CronDetector {
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
  
    private pathToCronJob: Record<string, DetectedCronJob> = {};
  
    public getDetectedJobs(): DetectedCronJob[] {
      return Object.values(this.pathToCronJob);
    }
  
    private async onNewJob(job: DetectedCronJob, filePath: string) {
      // HTTP PUT /api/cron/:id
      await this.onJobChanged(job, filePath);
    }
  
    private async onJobRemoved(job: DetectedCronJob, filePath: string) {
      // HTTP DELETE /api/cron/:id
      delete this.pathToCronJob[filePath];
    }
  
    private async onJobChanged(job: DetectedCronJob, filePath: string) {
      // HTTP PUT /api/cron/:id
      this.pathToCronJob[filePath] = job;
    }
  
    private on(fileChangeType: "changed" | "deleted" | "added") {
      return async (filePath: string) => {
        const previousJob = this.pathToCronJob[filePath];
  
        // console.log('filePath', filePath, fileChangeType)
        if (fileChangeType === "deleted") {
          if (previousJob) {
            await this.onJobRemoved(previousJob, filePath);
          }
  
          return;
        }
  
        const contents = fs.readFileSync(path.join(this.cwd, filePath), "utf-8");
        // TODO parse contents to get options
        if(this.hashTable.get(filePath) === this.toHash(contents)) {
            console.log('no change')
            return;
        }
        // console.log(contents)
        console.log('isProd', this.isProduction)
        // console.log(this.hashTable)

        this.hashTable.set(filePath, this.toHash(contents))
        
        const newJob =  { isValid: true, schedule: '' } as DetectedCronJob;
  
        if (!newJob) {
          if (previousJob) {
            await this.onJobRemoved(previousJob, filePath);
          }
  
          return;
        }
  
        if (!newJob.isValid) {
          console.error(
            `🚨Encountered invalid cron expression: ${newJob.schedule}`
          );
          return;
        }
  
        if (!previousJob && newJob) {
          return await this.onNewJob(newJob, filePath);
        }
  
        if (previousJob && newJob) {
          return await this.onJobChanged(newJob, filePath);
        }
      };
    }

    private toHash(str: string) {
        return createHash('sha256').update(str).digest('hex')
    }
  }
