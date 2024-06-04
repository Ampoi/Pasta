import { Node, Input } from "../model/node"
import { Flow } from "../model/flow"
import { flow } from "../hooks/flow"

export type PortPlace = {
    type: "input" | "output"
    blockID: string //TODO:BlockIDからNodeIDにする
    portID: string //TODO:BlockIDからNodeIDにする
}

export const addPortConnection = (from: PortPlace, to: PortPlace) => {
    if (
        from.blockID == to.blockID ||
        from.type == to.type
    ) return

    const newInput: Input = from.portID == "default" ? {
        type: "setting",
        value: flow.value.nodes[to.blockID].inputs?.default?.value
    } : {
        type: "port",
        value: {
            blockID: from.blockID,
            portID: from.portID
        }
    }

    const newBlock: Node = (() => {
        const tmp = {
            ...flow.value.nodes[to.blockID],
            defaultPortBlockID: from.blockID,
            inputs: {
                ...flow.value.nodes[to.blockID].inputs,
                [to.portID]: newInput
            }
        }
        if( tmp.trigger == true ) throw new Error("trigger node can't be toBlock")
        return tmp
    })()

    const newFlow: Flow = {
        ...flow,
        nodes: {
            ...flow.value.nodes,
            [to.blockID]: newBlock
        }
    }
    
    return newFlow
}