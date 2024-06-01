import { Node, Input } from "../model/node"
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
        value: flow.nodes[to.blockID].inputs?.default?.value,
        defaultPortBlockID: from.blockID
    } : {
        type: "port",
        value: {
            blockID: from.blockID,
            portID: from.portID
        }
    }

    const newBlock: Node = {
        ...flow.nodes[to.blockID],
        inputs: {
            ...flow.nodes[to.blockID].inputs,
            [to.portID]: newInput
        }
    }

    const newFlow: Flow = {
        ...flow,
        nodes: {
            ...flow.nodes,
            [to.blockID]: newBlock
        }
    }
    
    return newFlow
}