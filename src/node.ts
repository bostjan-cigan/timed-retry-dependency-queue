class Node {
    public id: string
    public afters: Array<string> = []

    constructor( id: string ) {
        this.id = id
        this.afters = []
    }
}

export default Node