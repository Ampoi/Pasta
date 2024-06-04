import { Node, Input } from "../model/node"
import { Flow } from "../model/flow"
import { flow } from "../hooks/flow"

export type PortPlace = {
    type: "input" | "output"
    nodeID: string
    portID: string
}

export const addPortConnection = (from: PortPlace, to: PortPlace) => {
    if (
        from.nodeID == to.nodeID ||
        from.type == to.type
    ) return

    const newInput: Input = from.portID == "default" ? {
        type: "setting",
        value: flow.value.nodes[to.nodeID].inputs?.default?.value
    } : {
        type: "port",
        value: {
            nodeID: from.nodeID,
            portID: from.portID
        }
    }

    const newBlock: Node = (() => {
        const tmp = {
            ...flow.value.nodes[to.nodeID],
            defaultPortNodeID: from.nodeID,
            inputs: {
                ...flow.value.nodes[to.nodeID].inputs,
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
            [to.nodeID]: newBlock
        }
    }
    
    return newFlow
}