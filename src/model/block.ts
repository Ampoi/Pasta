export type Block = {
    title: string
    description?: string
    ports: {
        [portID: string]: {
            [blockID: string]: string
        }
    }
}