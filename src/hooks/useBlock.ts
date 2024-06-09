import { readTextFile } from "@tauri-apps/api/fs"
import { computed, ref, watch } from "vue"
import { projectPath } from "../utils/projectPath"
import { DefaultBlock, TriggerBlock } from "../model/block";

export const useBlock = (_blockID: string) => {
    const blockID = ref<string>(_blockID)
    const blockJSONpath = computed(() => `${projectPath.value}/blocks/${blockID.value}/block.json`);
    const block = ref<DefaultBlock | TriggerBlock | undefined>();

    watch(blockID, async () => {
        if( blockID.value == "code" ) throw new Error("Code block is not supported")
        try {
            const fileText = await readTextFile(blockJSONpath.value);
            const fileJSON = JSON.parse(fileText) as DefaultBlock | TriggerBlock;
            block.value = fileJSON;
        } catch (error) {
            console.warn(error);
        }
    }, { immediate: true })()

    return { blockID, block }
}