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
    type: string
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
    create(defaultPortNodeID: string): CodeNode {
        return {
            title: "Code",
            code: true,
            defaultPortNodeID
        }
    }
}

export type Node = DefaultNode | CodeNode