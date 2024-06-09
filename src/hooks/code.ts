import { computed, ref, watch } from 'vue';
import { flowID } from './flow';
import { projectPath } from '../utils/projectPath';
import { createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export const code = ref<string | undefined>();
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

export const getCodeData = () => {
    let isArgs = false
    const args: { name: string, type: string }[] = []

    if( code.value == undefined ) return
    const codeLines = code.value.split("\n")

    const bodyLinesRange: {
        start?: number
        end: number
    } = {
        end: codeLines.length - 1
    }

    codeLines.forEach((line, row) => {
        if( row == 0 ){
            isArgs = true
        }else if( line == ") => {" ){
            isArgs = false
            bodyLinesRange.start = row + 2
        }else if( isArgs ){
            const pairText = line[line.length-1] == "," ? line.slice(0, line.length-1) : line
            const [ name, type ] = pairText.trim().split(": ")
            args.push({name, type})
        }
    })

    if( !bodyLinesRange.start ) throw new Error("bodyLinesの範囲の最初のインデックスを見つけられませんでした")

    const returnLine = codeLines[codeLines.length-2].replace(/\s+/g,'')
    const returnValueNames = returnLine.slice(7, returnLine.length-1).split(",")
    const returnValues = returnValueNames.map((returnValueName) => {
        return {
            type: "?",
            name: returnValueName
        }
    })

    return {
        args,
        bodyLinesRange: [
            bodyLinesRange.start, 1,
            bodyLinesRange.end-1, codeLines[bodyLinesRange.end-2].length+1,
        ],
        returnValues
    }
}