"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Queue = /** @class */ (function () {
    function Queue() {
        this.queue = {};
        this.start = -1;
        this.end = -1;
    }
    Queue.prototype.add = function (task) {
        this.enqueue(task);
    };
    Queue.prototype.addMany = function (tasks) {
        var _this = this;
        tasks.forEach(function (task) {
            _this.enqueue(task);
        });
    };
    Queue.prototype.isEmpty = function () {
        return this.size() === 0;
    };
    Queue.prototype.getNextTask = function () {
        return this.dequeue();
    };
    Queue.prototype.empty = function () {
        for (var property in this.queue) {
            delete this.queue[property];
        }
        this.start = -1;
        this.end = -1;
    };
    Queue.prototype.size = function () {
        return this.end - this.start;
    };
    Queue.prototype.enqueue = function (task) {
        this.queue[++this.end] = task;
    };
    Queue.prototype.dequeue = function () {
        if (this.size() > 0) {
            var next = this.queue[++this.start];
            delete this.queue[this.start];
            return next;
        }
        return undefined;
    };
    return Queue;
}());
exports.default = Queue;
