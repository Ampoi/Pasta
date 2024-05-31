import { Block, Input } from "../model/block"
import { Flow } from "../model/flow"

export type PortPlace = {
    type: "input" | "output"
    blockID: string
    portID: string
}

export const addPortConnection = (flow: Flow, from: PortPlace, to: PortPlace) => {
    if (
        from.blockID == to.blockID ||
        from.type == to.type
    ) return

    const newInput: Input = from.portID == "default" ? {
        type: "setting",
        value: flow.blocks[to.blockID].inputs?.default?.value,
        defaultPortBlockID: from.blockID
    } : {
        type: "port",
        value: {
            blockID: from.blockID,
            portID: from.portID
        }
    }

    const newBlock: Block = {
        ...flow.blocks[to.blockID],
        inputs: {
            ...flow.blocks[to.blockID].inputs,
            [to.portID]: newInput
        }
    }

    const newFlow: Flow = {
        ...flow,
        blocks: {
            ...flow.blocks,
            [to.blockID]: newBlock
        }
    }
    
    return newFlow
}