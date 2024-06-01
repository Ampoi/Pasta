type Value = {
    name: string;
    type: string;
};

export type Block = {
    name: string
    description: string
    icon: {
        value: string
        color: string
    }
    outputs: Value[]
} & ({
    trigger: true
    inputs?: undefined
} | {
    trigger: false
    inputs: Value[]
});