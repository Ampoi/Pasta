import { getAlphabet } from "../utils/getAlphabet"

type SettingInput = {
    type: "setting"
    value: any
}

type PortInput = {
    type: "port"
    value?: {
        nodeID: string
        portID: string
    }
}

export type Input = SettingInput | PortInput

type DefaultNode = {
    title: string
    blockID: string
    code: false
} & (
    (
        ({
            defaultPortNodeID?: undefined
            trigger: true
        } | {
            defaultPortNodeID: string
            trigger?: false
        }) &
        {
            inputs?: {
                [inputID: string]: Input
            }
        }
    ) | {
        defaultPortNodeID?: undefined
        trigger?: false
        inputs: {
            [inputID: string]: PortInput
        }
    }
)

type CodeNode = {
    title: string
    code: true
    blockID?: undefined
    codeID: string
} & ({
    defaultPortNodeID?: undefined
    inputs: {
        [inputID: string]: PortInput
    }
} | {
    defaultPortNodeID: string
    inputs?: undefined
})

export const CodeNode = {
    create(defaultPortNodeID: string, title = "Code"): CodeNode {
        return {
            title,
            code: true,
            codeID: getAlphabet(Math.floor(Math.random() * 10**10)),
            defaultPortNodeID
        }
    }
}

export type Node = DefaultNode | CodeNode