export type Block = {
    title: string
    description?: string
    connectedPorts: {
        [portID: string]: {
            [blockID: string]: string
        }
    }
}