type SettingInput = {
    type: "setting"
    value: any
}

type PortInput = {
    type: "port"
    value?: {
        blockID: string //TODO:BlockIDからNodeIDにする
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
            defaultPortBlockID?: undefined //TODO:BlockIDからNodeIDにする
            trigger: true
        } | {
            defaultPortBlockID: string //TODO:BlockIDからNodeIDにする
            trigger?: false
        }) &
        {
            inputs?: {
                [inputID: string]: Input
            }
        }
    ) | {
        defaultPortBlockID?: undefined //TODO:BlockIDからNodeIDにする
        trigger?: false
        inputs: {
            [inputID: string]: PortInput
        }
    }
)