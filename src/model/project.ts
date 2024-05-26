import type { Block } from "./block"

type Flow = {
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

export type Project = {
    title: string
    flows: Flow[]
}

export const Project = {
    create(): Project {
        return {
            title: "new project",
            flows: []
        }
    }
}