import { readTextFile } from "@tauri-apps/api/fs"
import { computed, ref, watch } from "vue"
import { projectPath } from "../utils/projectPath"
import { Block } from "../model/block";

export const useBlock = (_blockID: string) => {
    const blockID = ref<string>(_blockID)
    const blockJSONpath = computed(() => `${projectPath.value}/blocks/${blockID.value}/block.json`);
    const block = ref<Block | undefined>();

    watch(blockID, async () => {
        try {
            const fileText = await readTextFile(blockJSONpath.value);
            const fileJSON = JSON.parse(fileText) as Block;
            block.value = fileJSON;
        } catch (error) {
            console.warn(error);
        }
    }, { immediate: true })()

    return { blockID, block }
}