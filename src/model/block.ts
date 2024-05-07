export type Block = {
    title: string
    description?: string
    ports: {
        args?: string[]
        returnValues: string[]
    }
    connectedPorts: {
        [portID: string]: {
            [blockID: string]: string
        }
    }
}