import { computed, ref } from "vue"
import { projectPath } from "../utils/projectPath"
import { DefaultBlock } from "../model/block";
import { flowID } from "./flow";

import { watch as watchFile } from "tauri-plugin-fs-watch-api";
import { readTextFile } from "@tauri-apps/api/fs";
import { CodeData, getCodeData } from "../utils/getCodeData";

export const useCodeBlock = (_codeID: string) => {
    const codeID = ref<string>(_codeID)

    const codePath = computed(() => {
        if( !flowID.value ) throw new Error("flowID is not defined")
        return `${projectPath.value}/flows/${flowID.value}/codes/${codeID.value}.ts`
    });

    let readTextFileQue: number
    const codeData =  ref<CodeData>()

    //TODO:フォルダごと監視できるっぽいからフォルダごと監視したい
    watchFile(codePath.value, () => {
        console.log("file changed")
        
        if( readTextFileQue ) clearTimeout(readTextFileQue)
        readTextFileQue = setTimeout(async () => {
            clearTimeout(readTextFileQue)
            const code = await readTextFile(codePath.value)
            codeData.value = getCodeData(code)
        }, 1000)
    }, { delayMs: 200 })

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