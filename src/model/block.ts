type Value = {
    name: string;
    type: string;
};

export type CodeBlock = {
    name: string
    description: string
}

export type DefaultBlock = {
    name: string
    description: string
    icon: {
        value: string
        color: string
    }
    outputs: Value[]
    trigger?: false
    inputs: Value[]
}

export type TriggerBlock = {
    name: string
    description: string
    icon: {
        value: string
        color: string
    }
    outputs: Value[]
    trigger: true
    inputs?: undefined
}

export type Block = TriggerBlock | DefaultBlock