import { Block } from "./block"

export type Flow = {
    trigger: Block
    blocks: Record<string, Block>
}

export const Flow = {
    create(): Flow {
        return {
            trigger: {
                title: "trigger",
                connectedPorts: {},
                type: "code"
            },
            blocks: {}
        }
    }
}