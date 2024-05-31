import { Flow } from "../model/flow"
import { test } from 'vitest'
import { createRunnableCode } from "./createRunnableCode"

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

test('createCode', () => {
    const code = createRunnableCode(flow)
    console.log(code)
})