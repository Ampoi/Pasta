import type { Block } from "./block"

export type Project = {
    title: string
    flows: {
        trigger: Block
        blocks: Record<string, Block>
    }[]
}

export const Project = {
    get default(): Project {
        return {
            title: "new project",
            flows: [
                {
                    "trigger": {
                        "title": "trigger",
                        "ports": {
                            "returnValues": [
                                "a",
                                "b"
                            ]
                        },
                        "connectedPorts": {
                            "a": {
                                "A": "arg1"
                            },
                            "b": {
                                "B": "arg2"
                            }
                        }
                    },
                    "blocks": {
                        "A": {
                            "title": "Aaaa",
                            "ports": {
                                "args": [
                                    "arg1",
                                    "arg2"
                                ],
                                "returnValues": [
                                    "a",
                                    "b"
                                ]
                            },
                            "connectedPorts": {
                                "a": {
                                    "B": "arg1"
                                }
                            }
                        },
                        "B": {
                            "title": "Bbbb",
                            "ports": {
                                "args": [
                                    "arg1",
                                    "arg2"
                                ],
                                "returnValues": [
                                    "a",
                                    "b"
                                ]
                            },
                            "connectedPorts": {}
                        }
                    }
                }
            ]
        }
    }
}