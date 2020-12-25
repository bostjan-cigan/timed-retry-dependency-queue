[![Timed Retry Dependency Queue](assets/logo.png "Timed Retry Dependency Queue")](https://bostjan-cigan.com "Boštjan Cigan")
------------

# Timed Retry Dependency Queue

[![npm version](https://badge.fury.io/js/%40kijuub%2Ftimed-retry-dependency-queue.svg)](https://badge.fury.io/js/%40kijuub%2Ftimed-retry-dependency-queue) 
![Coverage](badges/coverage.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a queue implementation for the [Timed Retry Queue](https://www.npmjs.com/package/@kijuub/timed-retry-queue) package. It allows you to process a queue with dependencies on task execution.

## Getting started

First install the base package.

```bash
yarn add @kijuub/timed-retry-queue
npm install @kijuub/timed-retry-queue
```

Now install the queue implementation.

```bash
yarn add @kijuub/timed-retry-dependency-queue
npm install @kijuub/timed-retry-dependency-queue
```

## Usage

Check the default [readme](https://github.com/bostjan-cigan/timed-retry-queue#readme) on how to create a task executor. Afterwards you just need to create the queue.

### Adding tasks

To add tasks to the process method, you need to create the `TimedRetryQueueTasks` object. You can add both retry tasks or tasks that do not need to be retried.

```javascript
import { TimedRetryQueue } from '@kijuub/timed-retry-queue'
import { TimedRetryDependencyTaskQueue } from '@kijuub/timed-retry-dependency-queue'

const executer = new TimedRetryQueue()

const queue = new TimedRetryDependencyTaskQueue()

const dummyFunction = () => {
    console.log( `Dummy function triggered ...` )
}

queue.addMany( [
    {
        task: dummyFunction,
        parameters: {
            extra: {
                dependencies: [ 'tasktwo' ],
                id: 'taskone'
            }
        }
    },
    {
        task: dummyFunction,
        parameters: {
            extra: {
                dependencies: [],
                id: 'tasktwo'
            }
        }
    },
    {
        task: dummyFunction,
        parameters: {
            extra: {
                dependencies: [ 'taskone', 'tasktwo' ],
                id: 'taskthree'
            }
        }
    },
] )

const process = await executer.process( queue )
```

The `extra` parameters contain the `id` of the task which must be unique, the `dependencies` array contains the list of IDs that are dependant upon the completion of this task. Note that the `add` method is not supported, only `addMany`.

All of the default options of the Timed Retry Queue are also available.

**NOTE:** The task is deemed failed if an error is thrown.

## Contributions

If you would like to make any contribution you are welcome to do so.
