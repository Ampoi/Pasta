export type BlockRect = Record<"height" | "width", number>

export type BlockExposedData = {
    id: string
    getBlockRect: (callback: (rect: BlockRect) => void) => void
}

export type Block = {
    title: string
    description?: string
    type: "code" | string
    inputs?: {
        [inputID: string]: {
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
    }
}

type Value = {
    name: string;
    type: string;
};

export type BlockData = {
    name: string
    description: string
    icon: {
        value: string
        color: string
    }
    outputs: Value[]
    executeMainFilePath: string
} & ({
    trigger: true
    inputs?: undefined
} | {
    trigger: false
    inputs: Value[]
});