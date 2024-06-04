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

export type Node = {
    title: string
    description?: string
    type: "code" | string
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