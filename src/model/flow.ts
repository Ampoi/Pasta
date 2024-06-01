import { Node } from "./node"

export type Flow = {
    nodes: {
        trigger: Node
    } & Record<string, Node>
}

export const Flow = {
    create(): Flow {
        return {
            nodes: {
                trigger: {
                    title: "trigger",
                    type: "onExecute"
                }
            }
        }
    }
}