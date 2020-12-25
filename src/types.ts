import { TimedRetryQueueTask } from '@kijuub/timed-retry-queue'
import Node from './node'

export interface DependencyQueueTasks {
	[ key: string ]: TimedRetryQueueTask
}

export interface DependencyQueueDependencyList {
	[ key: string ]: Array<string>
}

export interface DependencyQueueNodeList {
	[ key: string ]: Node
}

export interface DependencyQueueVisitedNodes {
	[ key: string ]: boolean
}