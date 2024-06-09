import { computed, ref } from "vue"
import { projectPath } from "../utils/projectPath"
import { DefaultBlock } from "../model/block";
import { flowID } from "./flow";

export const useCodeBlock = (_codeID: string) => {
    const codeID = ref<string>(_codeID)

    const codePath = computed(() => {
        if( !flowID.value ) throw new Error("flowID is not defined")
        return `${projectPath.value}/flows/${flowID.value}/codes/${codeID.value}.ts`
    });
    
    const code = ref<string>(codePath.value);

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
            inputs: [],
            outputs: []
        }
    })

    return { blockID: codeID, block, code }
}