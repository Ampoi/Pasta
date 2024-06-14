import { computed, ref, watch } from 'vue';
import { flowID } from './flow';
import { projectPath } from '../utils/projectPath';
import { createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { getCodeData } from '../utils/getCodeData';

export const code = ref<string | undefined>();

export const codeData = computed({
    get(){
        if( !code.value ) return
        
        return getCodeData(code.value)
    },
    set(newValue){
        if( !newValue ) return
        
        code.value = [
            "export default (",
            (newValue.args ?? []).map((input) => {
                return `  ${input.name}: ${input.type}`
            }).join(",\n"),
            ") => {",
            ...newValue.bodyLines,
            `  return { ${
                newValue.outputs.map(({ name }) => name).join(", ")
            } }`,
            "}"
        ].join("\n")
    }
})

export const codeID = ref<string | undefined>()

const codePath = computed(() => {
    if( !flowID.value ) return
    if( !codeID.value ) return
    return `${projectPath.value}/flows/${flowID.value}/codes/${codeID.value}.ts`
})

watch(code, async (newCode, oldCode) => {
    if( newCode == oldCode ){console.log("iwafjoiwa");return;}
    if( !codePath.value ) return
    if( newCode == undefined ) return

    if( !(await exists(`${projectPath.value}/flows/${flowID.value}/codes`)) ){
        await createDir(`${projectPath.value}/flows/${flowID.value}/codes`)
    }
    await writeTextFile(codePath.value, newCode)
})

watch(codePath, async () => {
    if( !codePath.value ){
        code.value = undefined
        return
    }

    try {
        const fileText = await readTextFile(codePath.value);
        code.value = fileText;
    } catch (error) {
        code.value = ""
        console.warn(error);
    }
}, { immediate: true })