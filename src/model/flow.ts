import { Block } from "./block"

export type Flow = {
    blocks: {
        trigger: Block
    } & Record<string, Block>
}

export const Flow = {
    create(): Flow {
        return {
            blocks: {
                trigger: {
                    title: "trigger",
                    connectedPorts: {},
                    type: "onExecute"
                }
            }
        }
    }
}