"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_1 = __importDefault(require("./node"));
var edge_1 = __importDefault(require("./edge"));
var TimedRetryDependencyTaskQueue = /** @class */ (function () {
    function TimedRetryDependencyTaskQueue() {
        /**
         * Tasks storage.
         *
         * First one stores tasks by key, second one is the task order array when the topological tree
         * is built.
         */
        this.tasks = {};
        this.taskOrder = [];
        /**
         * Data structures needed for building topological tree
         */
        this.dependenciesList = {};
        this.nodes = {};
        this.visited = {};
    }
    TimedRetryDependencyTaskQueue.prototype.add = function (task) {
        throw new Error("Single task adding not supported in a dependency queue. Use addMany to add tasks to queue.");
    };
    TimedRetryDependencyTaskQueue.prototype.addMany = function (tasks) {
        var _this = this;
        if (tasks.length === 0) {
            return;
        }
        if (this.size() > 0) {
            throw Error("Tasks can not be added to an existing queue. Use empty() first.");
        }
        tasks.forEach(function (task) {
            if (!task.parameters) {
                throw Error("A task must provide the parameters option.");
            }
            if (!task.parameters.extra) {
                throw Error("A task must provide the parameters extra option.");
            }
            if (!task.parameters.extra.id) {
                throw Error("A dependency task must provide a unique id parameter for the task ID.");
            }
            var taskId = task.parameters.extra.id;
            _this.tasks[taskId] = task;
            if (task.parameters.extra.dependencies) {
                _this.dependenciesList[taskId] = task.parameters.extra.dependencies;
            }
            else {
                _this.dependenciesList[taskId] = [];
            }
        });
        this.createTopologicalNodes();
        this.sortTasks();
        this.clearData();
    };
    TimedRetryDependencyTaskQueue.prototype.isEmpty = function () {
        return Object.keys(this.tasks).length === 0 && this.taskOrder.length === 0;
    };
    TimedRetryDependencyTaskQueue.prototype.getNextTask = function () {
        var nextTaskId = this.taskOrder.pop();
        if (nextTaskId) {
            var nextTask = this.tasks[nextTaskId];
            return nextTask;
        }
        return undefined;
    };
    TimedRetryDependencyTaskQueue.prototype.empty = function () {
        var _this = this;
        this.taskOrder.length = 0;
        Object.keys(this.tasks).forEach(function (key) {
            delete _this.tasks[key];
        });
        this.clearData();
    };
    TimedRetryDependencyTaskQueue.prototype.size = function () {
        return Object.keys(this.tasks).length;
    };
    /**
     * Clears data after sorting is done.
     */
    TimedRetryDependencyTaskQueue.prototype.clearData = function () {
        var _this = this;
        Object.keys(this.dependenciesList).forEach(function (key) {
            delete _this.dependenciesList[key];
        });
        Object.keys(this.nodes).forEach(function (key) {
            delete _this.nodes[key];
        });
        Object.keys(this.visited).forEach(function (key) {
            delete _this.visited[key];
        });
    };
    /**
     * Creates topological nodes (from and to nodes.)
     */
    TimedRetryDependencyTaskQueue.prototype.createTopologicalNodes = function () {
        var _this = this;
        var edges = this.getEdges();
        edges.forEach(function (edge) {
            var from = edge.from;
            var to = edge.to;
            if (!_this.nodes[from])
                _this.nodes[from] = new node_1.default(from);
            if (!_this.nodes[to])
                _this.nodes[to] = new node_1.default(to);
            _this.nodes[from].afters.push(to);
        });
    };
    /**
     * Gets edges of the graph.
     */
    TimedRetryDependencyTaskQueue.prototype.getEdges = function () {
        var _this = this;
        var edges = [];
        Object.keys(this.dependenciesList).forEach(function (originNode) {
            _this.dependenciesList[originNode].forEach(function (targetNode) {
                edges.push(new edge_1.default(originNode, targetNode));
            });
        });
        return edges;
    };
    /**
     * Visits nodes.
     *
     * @param id
     * @param ancestors
     */
    TimedRetryDependencyTaskQueue.prototype.visitNode = function (id, ancestors) {
        var _this = this;
        if (ancestors === void 0) { ancestors = []; }
        var node = this.nodes[id];
        var nodeId = node.id;
        if (this.visited[id])
            return;
        ancestors.push(nodeId);
        this.visited[id] = true;
        node.afters.forEach(function (afterId) {
            if (ancestors.indexOf(afterId) >= 0) {
                throw Error("A cycle has been found. " + afterId + " is in " + nodeId + ".");
            }
            _this.visitNode(afterId, ancestors.map(function (v) { return v; }));
        });
        this.taskOrder.push(nodeId);
    };
    /**
     * Sorts tasks based on dependencies.
     */
    TimedRetryDependencyTaskQueue.prototype.sortTasks = function () {
        var _this = this;
        Object.keys(this.nodes).forEach(function (key, _) {
            _this.visitNode(key);
        });
    };
    return TimedRetryDependencyTaskQueue;
}());
exports.default = TimedRetryDependencyTaskQueue;
