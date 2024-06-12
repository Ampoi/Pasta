import { computed, ref } from "vue"
import { projectPath } from "../utils/projectPath"
import { Block, DefaultBlock } from "../model/block";
import { flowID } from "./flow";

import { watch as watchFile } from "tauri-plugin-fs-watch-api";
import { readTextFile } from "@tauri-apps/api/fs";
import { CodeData, getCodeData } from "../utils/getCodeData";
import { Que } from "../utils/que";

export const useCodeBlock = (_codeID: string) => {
    const codeID = ref<string>(_codeID)

    const codePath = computed(() => {
        if( !flowID.value ) throw new Error("flowID is not defined")
        return `${projectPath.value}/flows/${flowID.value}/codes/${codeID.value}.ts`
    });

    const codeData =  ref<CodeData>()

    const updateCodeDataQue = new Que(async () => {
        console.log("read!")
        const code = await readTextFile(codePath.value)
        codeData.value = getCodeData(code)
    }, 1000)

    updateCodeDataQue.add()

    //TODO:フォルダごと監視できるっぽいからフォルダごと監視したい
    watchFile(codePath.value, () => {
        updateCodeDataQue.add()
    }, { delayMs: 500 })

    const block = computed<DefaultBlock | undefined>(() => {
        return {
            name: codeID.value,
            description: "",
            icon: {
                value: "fluent:code-text-16-filled",
                color: "#2563eb"
            },
            trigger: false,
            //ここら辺を変更する
            inputs: codeData.value?.args ?? [],
            outputs: codeData.value?.outputs ?? []
        }
    })

    return { blockID: codeID, block }
}

export const getCodeBlock = async (codeID: string) => {
    if( !flowID.value ) throw new Error("flowID is not defined")
    const codePath = `${projectPath.value}/flows/${flowID.value}/codes/${codeID}.ts`

    const code = await readTextFile(codePath)
    const codeData = getCodeData(code)

    const block: Block = {
        name: codeID,
        description: "",
        icon: {
            value: "fluent:code-text-16-filled",
            color: "#2563eb"
        },
        trigger: false,
        //ここら辺を変更する
        inputs: codeData?.args ?? [],
        outputs: codeData?.outputs ?? []
    }

    return block
}