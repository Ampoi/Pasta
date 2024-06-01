import { Flow } from "../model/flow"
import { test } from 'vitest'
import { createRunnableCode } from "./createRunnableCode"
import { BlockData } from "../model/block"

const flow: Flow = {
    "blocks": {
        "trigger": {
            "title": "trigger",
            "type": "onExecute"
        },
        "A": {
            "title": "A",
            "type": "sum",
            "inputs": {
                "a": {
                    "type": "setting",
                    "value": 10,
                    "defaultPortBlockID": "trigger"
                },
                "b": {
                    "type": "setting",
                    "value": 20,
                    "defaultPortBlockID": "trigger"
                }
            }
        },
        "B": {
            "title": "B",
            "type": "sum",
            "inputs": {
                "a": {
                    "type": "setting",
                    "value": 10,
                    "defaultPortBlockID": "trigger"
                },
                "b": {
                    "type": "setting",
                    "value": 20,
                    "defaultPortBlockID": "trigger"
                }
            }
        },
        "C": {
            "title": "B",
            "type": "sum",
            "inputs": {
                "a": {
                    "type": "port",
                    "value": {
                        "blockID": "A",
                        "portID": "result"
                    }
                },
                "b": {
                    "type": "port",
                    "value": {
                        "blockID": "B",
                        "portID": "result"
                    }
                }
            }
        }
    }
}

const blocks: { [blockID: string]: BlockData } = {
    sum: {
        "name": "加算",
        "description": "2つの数値を足し合わせます。",
        "icon": {
            "value": "fluent:add-12-filled",
            "color": "#FF8F1B"
        },
        "trigger": false,
        "inputs": [
            {
                "name": "a",
                "type": "number"
            },
            {
                "name": "b",
                "type": "number"
            }
        ],
        "outputs": [
            {
                "name": "result",
                "type": "number"
            }
        ]
    }
}

test('createCode', () => {
    const code = createRunnableCode(flow, blocks)
    console.log(code)
})