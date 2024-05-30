import { Flow } from "../model/flow"

export type PortPlace = {
    type: "arg" | "returnValue"
    blockID: string
    portID: string
}

export const addPortConnection = (flow: Flow, from: PortPlace, to: PortPlace) => {
    if (
        from.blockID == to.blockID ||
        from.type == to.type
    ) return

    const newFlow: Flow = {
        ...flow,
        blocks: {
            ...flow.blocks,
            [from.blockID]: {
                ...flow.blocks[from.blockID],
                connectedPorts: {
                    ...flow.blocks[from.blockID].connectedPorts,
                    [from.portID]: {
                        ...flow.blocks[from.blockID].connectedPorts[from.portID],
                        [to.blockID]: to.portID
                    }
                }
            }
        }
    }
    
    return newFlow
}