export type BlockRect = Record<"height" | "width", number>

export type BlockExposedData = {
    id: string
    getBlockRect: (callback: (rect: BlockRect) => void) => void
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