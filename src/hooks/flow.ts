import { computed, ref, watch } from "vue"
import { Flow } from "../model/flow"
import { createDir, exists, readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { projectPath } from "../utils/projectPath"
import { CodeNode, Node } from "../model/node"
import { getAlphabet, getNumber } from "../utils/getAlphabet"
import { Input } from "../model/node"
import { createLayers } from "../utils/createLayers"

const isFlow = (flow: unknown): flow is Flow => {
    if (!(
        (typeof flow == "object" && flow != null) &&
        ("nodes" in flow) &&
        !(flow.nodes instanceof Array)
    )) return false

    return true
}

export const flowID = ref<string | undefined>()
const flowPath = computed(() => `${projectPath.value}/flows/${flowID.value}/main.json`)

export const flow = ref(Flow.create())

export const updateFlow = async () => {
    if (flowID.value == undefined) return

    try {
        const fileText = await readTextFile(flowPath.value)
        const fileJSON = JSON.parse(fileText)
        if (!isFlow(fileJSON)) throw new Error(`Invalid Flow: ${flowPath}`)
        flow.value = fileJSON
    } catch (e) {
        console.warn(`flowの更新中にエラーが発生しました:\n${e}`)
    }
}

updateFlow().then(() => {
    watch(flow, async () => {
        console.log("flowが更新されました")
        try {
            await writeTextFile(flowPath.value, JSON.stringify(flow.value))
        } catch (e) {
            console.warn(`flowの保存中にエラーが発生しました:\n${e}`)
        }
    }, { deep: true })
})

watch(flowID, updateFlow)

export const createNode = (blockID: string, fromNodeID: string, createFrom: "input" | "output") => {
    const nodeNamesWithoutTrigger = Object.keys(flow.value.nodes).filter((nodeName) => nodeName != "trigger")
    const newNodeNumber = nodeNamesWithoutTrigger.length == 0 ? 0 : getNumber(nodeNamesWithoutTrigger.sort().reverse()[0]) + 1

    const newNodeID = getAlphabet(newNodeNumber)
    if (createFrom == "output") {
        const newNode: Node = blockID == "code" ?
            CodeNode.create(fromNodeID, newNodeID)
            : {
                title: newNodeID,
                blockID,
                defaultPortNodeID: fromNodeID,
                code: false
            }
        flow.value.nodes = { ...flow.value.nodes, [newNodeID]: newNode }
    }
}

export const getFlowIDs = async () => {
    const fileEntries = await readDir(`${projectPath.value}/flows`).catch((e) => {
        console.log(e)
        return []
    })

    const directoryNames = fileEntries
        .filter(entry => entry.children)
        .map(entry => entry.name)
        .filter((name): name is string => !!name)

    return directoryNames
}

export const createFlow = async (id: string) => {
    const newFlow = Flow.create()
    const flowDirectoryPath = `${projectPath.value}/flows/${id}/`
    if( !(await exists(`${projectPath.value}/flows`)) ){
        await createDir(`${projectPath.value}/flows`)
    }
    await createDir(flowDirectoryPath)
    await writeTextFile({
        path: `${flowDirectoryPath}/main.json`,
        contents: JSON.stringify(newFlow)
    })
    flowID.value = id
    await updateFlow()
}

export type PortPlace = {
    type: "input" | "output"
    nodeID: string
    portID: string
}

export const connectPorts = (from: PortPlace, to: PortPlace) => {
    if (
        from.nodeID == to.nodeID ||
        from.type == to.type
    ) return

    const newInput: Input = from.portID == "default" ? {
        type: "setting",
        value: flow.value.nodes[to.nodeID].inputs?.default?.value
    } : {
        type: "port",
        value: {
            nodeID: from.nodeID,
            portID: from.portID
        }
    }

    const newBlock: Node = (() => {
        const oldNode: Node = flow.value.nodes[to.nodeID]
        if( !oldNode.code && oldNode.trigger == true ) throw new Error("trigger node can't be toBlock")

        const tmp = {
            ...oldNode,
            defaultPortNodeID: from.nodeID,
            inputs: {
                ...oldNode.inputs,
                [to.portID]: newInput
            }
        } as Node

        return tmp
    })()

    const newFlow: Flow = {
        ...flow.value,
        nodes: {
            ...flow.value.nodes,
            [to.nodeID]: newBlock
        }
    }

    try{
        console.log(newFlow)
        console.log(createLayers(newFlow))

        flow.value = newFlow
    }catch(e){
        console.warn(e)
    }
}