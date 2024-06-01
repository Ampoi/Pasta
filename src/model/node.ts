export type Input = {
    type: "setting"
    value: any
    defaultPortBlockID: string
} |  {
    type: "port"
    value: {
        blockID: string
        portID: string
    }
}

export type Node = {
    title: string
    description?: string
    type: "code" | string
    inputs?: {
        [inputID: string]: Input
    }
}