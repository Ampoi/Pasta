import { readDir, readTextFile } from "@tauri-apps/api/fs";
import { computed } from "vue";
import { Block } from "../model/block";
import { projectPath } from "./projectPath";

const blocksPath = computed(() => `${projectPath.value}/blocks`)

const getAllBlockNames = async (): Promise<string[]> => {
  try {
    const entries = await readDir(blocksPath.value);
    const directories = entries
      .filter(entry => entry.children !== undefined)
      .map(entry => entry.name)
      .filter((name): name is string => !!name)
    return directories;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

export const getAllBlocks = async (): Promise<Record<string, Block>> => {
    const blockNames = await getAllBlockNames()
    const blocks: Record<string, Block> = {}
    for (const blockName of blockNames) {
        const blockPath = `${blocksPath.value}/${blockName}/block.json`
        try {
            const fileText = await readTextFile(blockPath)
            const fileJSON = JSON.parse(fileText) as Block
            blocks[blockName] = fileJSON
        } catch (error) {
            console.warn(`an error occurred on blockName: ${blockName}:\n${error}`)
        }
    }
    return blocks
}