import { computed, ref, watch } from "vue"
import { Flow } from "../model/flow"
import { createDir, exists, readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs"
import { projectPath } from "../utils/projectPath"
import { Node } from "../model/node"
import { getAlphabet } from "../utils/getAlphabet"

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

export const createNode = (fromNodeID: string, createFrom: "input" | "output") => {
    const newNodeID = getAlphabet(Math.floor(Math.random() * (10 ** 5)))
    if (createFrom == "output") {
        const newNode: Node = {
            title: "",
            type: "sum",
            defaultPortNodeID: fromNodeID
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