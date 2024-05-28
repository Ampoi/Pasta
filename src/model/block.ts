export type BlockRect = Record<"height" | "width", number>

export type BlockExposedData = {
    id: string
    getBlockRect: ( callback: (rect: BlockRect) => void) => void
}

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