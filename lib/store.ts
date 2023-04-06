import { Queue } from "./queue/client";

export class Store {
    private static instance: Store;
    private queues: Map<string, Queue>;

    private constructor() {
        this.queues = new Map();
    }

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }

        return Store.instance;
    }

    public addQueue(name: string, queue: Queue): void {
        this.queues.set(name, queue);
      }
    
      public getQueue(name: string): Queue | undefined {
        return this.queues.get(name);
      }
    
      public deleteQueue(name: string): void {
        this.queues.delete(name);
      }
}