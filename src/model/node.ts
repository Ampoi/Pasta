type SettingInput = {
    type: "setting"
    value: any
}

type PortInput = {
    type: "port"
    value: {
        blockID: string
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
            defaultPortBlockID?: undefined
            trigger: true
        } | {
            defaultPortBlockID: string
            trigger?: false
        }) &
        {
            inputs?: {
                [inputID: string]: Input
            }
        }
    ) | {
        defaultPortBlockID?: undefined
        trigger?: false
        inputs: {
            [inputID: string]: PortInput
        }
    }
)