import { ITimedRetryQueueTasks, TimedRetryQueueTask } from '@kijuub/timed-retry-queue'

import Node from './node'
import Edge from './edge'

import {
	DependencyQueueTasks,
	DependencyQueueDependencyList,
	DependencyQueueNodeList,
	DependencyQueueVisitedNodes
} from './types'

class TimedRetryDependencyTaskQueue implements ITimedRetryQueueTasks {
	/**
	 * Tasks storage.
	 * 
	 * First one stores tasks by key, second one is the task order array when the topological tree
	 * is built.
	 */
	private tasks: DependencyQueueTasks = {}
	private taskOrder: Array<string> = []

	/**
	 * Data structures needed for building topological tree
	 */
	private dependenciesList: DependencyQueueDependencyList = {}
	private nodes: DependencyQueueNodeList = {}
	private visited: DependencyQueueVisitedNodes = {}

	constructor() {}

	add( task: TimedRetryQueueTask ): void {
		throw new Error( `Single task adding not supported in a dependency queue. Use addMany to add tasks to queue.` )
	}

	addMany( tasks: Array<TimedRetryQueueTask> ): void {
		if ( tasks.length === 0 ) {
			return
		}

		if ( this.size() > 0 ) {
			throw Error( `Tasks can not be added to an existing queue. Use empty() first.` )
		}

		tasks.forEach( ( task ) => {
			if ( ! task.parameters ) {
				throw Error( `A task must provide the parameters option.` )
			}
			if ( ! task.parameters.extra ) {
				throw Error( `A task must provide the parameters extra option.` )
			}
			if ( ! task.parameters.extra.id ) {
				throw Error( `A dependency task must provide a unique id parameter for the task ID.` )
			}
			const taskId: string = task.parameters.extra.id

			this.tasks[ taskId ] = task

			if ( task.parameters.extra.dependencies ) {
				this.dependenciesList[ taskId ] = task.parameters.extra.dependencies
			} else {
				this.dependenciesList[ taskId ] = []
			}
		} )
		this.createTopologicalNodes()
		this.sortTasks()
		this.clearData()
	}

	isEmpty(): boolean {
		return Object.keys( this.tasks ).length === 0 && this.taskOrder.length === 0
	}

	getNextTask(): TimedRetryQueueTask | undefined {
		const nextTaskId: string | undefined = this.taskOrder.pop()
		if ( nextTaskId ) {
			const nextTask = this.tasks[ nextTaskId ]
			return nextTask
		}
		return undefined
	}

	empty(): void {
		this.taskOrder.length = 0
		Object.keys( this.tasks ).forEach( ( key ) => {
			delete this.tasks[ key ]
		} )
		this.clearData()
	}

	size(): number {
		return Object.keys( this.tasks ).length
	}

	/**
	 * Clears data after sorting is done.
	 */
	private clearData(): void {
		Object.keys( this.dependenciesList ).forEach( ( key ) => {
			delete this.dependenciesList[ key ]
		})
		Object.keys( this.nodes ).forEach( ( key ) => {
			delete this.nodes[ key ]
		})
		Object.keys( this.visited ).forEach( ( key ) => {
			delete this.visited[ key ]
		})
	}

	/**
	 * Creates topological nodes (from and to nodes.)
	 */
	private createTopologicalNodes(): void {
		const edges = this.getEdges()

		edges.forEach( ( edge ) => {
			const from = edge.from
			const to = edge.to

			if ( ! this.nodes[ from ] ) this.nodes[ from ] = new Node( from )
			if ( ! this.nodes[ to ] ) this.nodes[ to ] = new Node( to )

			this.nodes[ from ].afters.push( to )
		} )
	}

	/**
	 * Gets edges of the graph.
	 */
	private getEdges(): Array<Edge> {
		const edges: Array<Edge> = []

		Object.keys( this.dependenciesList ).forEach( originNode => {
			this.dependenciesList[ originNode ].forEach( targetNode => {
				edges.push( new Edge( originNode, targetNode ) )
			} )
		} )

		return edges
	}

	/**
	 * Visits nodes.
	 * 
	 * @param id
	 * @param ancestors 
	 */
	private visitNode( id: string, ancestors: Array<string> = [] ): void {
		const node = this.nodes[ id ]
		const nodeId = node.id

		if ( this.visited[ id ] ) return

		ancestors.push( nodeId )

		this.visited[ id ] = true

		node.afters.forEach( afterId => {
			if ( ancestors.indexOf( afterId ) >= 0 ) {
				throw Error( `A cycle has been found. ${ afterId } is in ${ nodeId }.` )
			}
			this.visitNode( afterId, ancestors.map( v => v ) )
		} )
		this.taskOrder.push( nodeId )
	}

	/**
	 * Sorts tasks based on dependencies.
	 */
	private sortTasks(): void {
		Object.keys( this.nodes ).forEach( ( key, _ ) => {
			this.visitNode( key )
		} )
	}

}

export default TimedRetryDependencyTaskQueue