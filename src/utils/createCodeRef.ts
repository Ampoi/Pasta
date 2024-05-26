import { readTextFile } from "@tauri-apps/api/fs"
import { ref } from "vue"
import { getBlockData } from "./getBlockData"

export const createCodeRef = (projectPath: string, flowIndex: number, blockID: string) => {
    const defaultCode = [
      "export default (",
      ") => {",
      "  return {}",
      "}"
    ].join("\n")
    const blockFilePath = `${projectPath}/flows/${flowIndex}/${blockID}.ts`
    const code = ref(defaultCode)
    const updateCode = async () => {
      try {
        const fileCode = await readTextFile(blockFilePath)
        try {
          getBlockData(fileCode)
          code.value = fileCode
        }catch(e){
          code.value = defaultCode
        }
      }catch(e){
        code.value = defaultCode
      }
    }
    updateCode()

    return {
      code,
      updateCode
    }
}