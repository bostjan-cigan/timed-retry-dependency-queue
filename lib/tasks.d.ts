import { TimedRetryQueueTask, ITimedRetryQueueTasks } from './index';
declare class Queue implements ITimedRetryQueueTasks {
    private queue;
    private start;
    private end;
    constructor();
    add(task: TimedRetryQueueTask): void;
    addMany(tasks: Array<TimedRetryQueueTask>): void;
    isEmpty(): boolean;
    getNextTask(): TimedRetryQueueTask | undefined;
    empty(): void;
    size(): number;
    private enqueue;
    private dequeue;
}
export default Queue;
