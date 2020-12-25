import { TimedRetryDependencyTaskQueue } from '../src/index'

const dummyFunction = () => {
	console.log( `Dummy function triggered ...` )
}

const taskOne = {
	task: dummyFunction,
	parameters: {
		extra: {
			dependencies: [ 'tasktwo' ],
			id: 'taskone'
		}
	}
}

const noParameterTask = {
	task: dummyFunction
}

const noParameterExtraTask = {
	task: dummyFunction,
	parameters: {}
}

const taskTwo = {
	task: dummyFunction,
	parameters: {
		extra: {
			dependencies: [],
			id: 'tasktwo'
		}
	}
}

const cycle = {
	taskOne: {
		task: dummyFunction,
		parameters: {
			extra: {
				dependencies: [ 'taskone' ],
				id: 'tasktwo'
			}
		}	
	},
	taskTwo: {
		task: dummyFunction,
		parameters: {
			extra: {
				dependencies: [ 'tasktwo' ],
				id: 'taskone'
			}
		}	
	}
}

const nonDependantTask = {
	task: dummyFunction,
	parameters: {
		extra: {
			id: 'taskthree'
		}
	}
}

const taskWithoutId = {
	task: dummyFunction,
	parameters: {
		extra: {}
	}
}


describe( 'Add test', () => {
	it( 'Add single element add()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		expect( queue.add ).toThrow( Error )
	} )
	it( 'Empty array addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [] )
		expect( queue.getNextTask() ).toBe( undefined )
	} )
	it( 'Two dependant tasks addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne, taskTwo ] )
		expect( queue.size() ).toBe( 2 )
	} )
	it( 'Cycle addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		try {
			queue.addMany( [ cycle.taskOne, cycle.taskTwo ] )
		} catch ( e ) {
			expect( e.toString() ).toBe( 'Error: A cycle has been found. tasktwo is in taskone.' )
		}
	} )
	it( 'Readd to queue addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne ] )
		try {
			queue.addMany( [ taskTwo ] )
		} catch ( e ) {
			expect( e.toString() ).toBe( 'Error: Tasks can not be added to an existing queue. Use empty() first.' )
		}
	} )
	it( 'Add to queue without ID addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		try {
			queue.addMany( [ taskOne, taskWithoutId ] )
		} catch ( e ) {
			expect( e.toString() ).toBe( 'Error: A dependency task must provide a unique id parameter for the task ID.' )
		}
	} )
	it( 'Add to queue without dependencies addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne, nonDependantTask ] )
		expect( queue.size() ).toBe( 2 )
	} )
	it( 'Add to queue errors addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		try {
			queue.addMany( [ noParameterTask ] )
		} catch ( e ) {
			expect( e.toString() ).toBe( 'Error: A task must provide the parameters option.' )
		}
	} )
	it( 'Add to queue errors no extra addMany()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		try {
			queue.addMany( [ noParameterExtraTask ] )
		} catch ( e ) {
			expect( e.toString() ).toBe( 'Error: A task must provide the parameters extra option.' )
		}
	} )
} )

describe( 'Methods test', () => {
	it( 'isEmpty()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		expect( queue.isEmpty() ).toBe( true )
	} )
	it( 'isEmpty() with added element', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne, taskTwo ] )
		expect( queue.isEmpty() ).toBe( false )
	} )
	it( 'getNextTask()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne, taskTwo ] )
		let task = queue.getNextTask()
		expect( task ).toStrictEqual( taskOne )
		task = queue.getNextTask()
		expect( task ).toStrictEqual( taskTwo )
		task = queue.getNextTask()
		expect( task ).toEqual( undefined )
	} )
	it( 'empty()', () => {
		const queue = new TimedRetryDependencyTaskQueue()
		queue.addMany( [ taskOne, taskTwo ] )
		queue.empty()
		let task = queue.getNextTask()
		expect( task ).toEqual( undefined )
		let size = queue.size()
		expect( size ).toBe( 0 )
		expect( queue.isEmpty() ).toBe( true )
	} )
} )