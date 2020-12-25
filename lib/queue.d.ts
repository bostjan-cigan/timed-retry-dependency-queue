import { ITimedRetryQueueTasks, TimedRetryQueueTask } from '@kijuub/timed-retry-queue';
declare class TimedRetryDependencyTaskQueue implements ITimedRetryQueueTasks {
    /**
     * Tasks storage.
     *
     * First one stores tasks by key, second one is the task order array when the topological tree
     * is built.
     */
    private tasks;
    private taskOrder;
    /**
     * Data structures needed for building topological tree
     */
    private dependenciesList;
    private nodes;
    private visited;
    constructor();
    add(task: TimedRetryQueueTask): void;
    addMany(tasks: Array<TimedRetryQueueTask>): void;
    isEmpty(): boolean;
    getNextTask(): TimedRetryQueueTask | undefined;
    empty(): void;
    size(): number;
    /**
     * Clears data after sorting is done.
     */
    private clearData;
    /**
     * Creates topological nodes (from and to nodes.)
     */
    private createTopologicalNodes;
    /**
     * Gets edges of the graph.
     */
    private getEdges;
    /**
     * Visits nodes.
     *
     * @param id
     * @param ancestors
     */
    private visitNode;
    /**
     * Sorts tasks based on dependencies.
     */
    private sortTasks;
}
export default TimedRetryDependencyTaskQueue;
