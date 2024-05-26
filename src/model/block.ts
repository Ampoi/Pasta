export type Block = {
    title: string
    description?: string
    type: "code" | string
    connectedPorts: {
        [portID: string]: {
            [blockID: string]: string
        }
    }
}