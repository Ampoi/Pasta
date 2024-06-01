import { readTextFile } from "@tauri-apps/api/fs"
import { ref } from "vue"
import { getCodeData } from "./getCodeData"

export const createCodeRef = (projectID: string, flowIndex: string, blockID: string) => {
    const defaultCode = [
      "export default (",
      ") => {",
      "  return {}",
      "}"
    ].join("\n")
    const blockFilePath = `${projectID}/flows/${flowIndex}/code/${blockID}.ts`
    const code = ref(defaultCode)
    const updateCode = async () => {
      try {
        const fileCode = await readTextFile(blockFilePath)
        getCodeData(fileCode)
        code.value = fileCode
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