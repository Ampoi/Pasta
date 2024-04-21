export type Block = {
    title: string
    description?: string
    connectedTo: {
        [blockID: string]: string[]
    }
}