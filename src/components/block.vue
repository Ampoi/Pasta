<template>
    <div
        class="bg-white py-2 px-4 rounded-xl w-[400px] flex flex-col gap-2 border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 relative">
        <div class="flex flex-row">
        <input
            type="text"
            class="bg-gray-100 px-2 py-1 rounded-md outline-none"
            :value="blockSettings.title">
        </div>
        <div
            id="editorElement"
            ref="editorElement"
            class="h-[200px]"/>
        
        <div class="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[calc(100%-2rem)] flex flex-col gap-2">
            <div class="bg-white py-1 px-1.5 rounded-xl w-[160px] border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2">
                <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-400 grid place-content-center">
                    T
                </div>
                <p class="overflow-hidden text-ellipsis">ofeiowajfoa</p>
            </div>
            <div class="bg-white py-1 px-1.5 rounded-xl w-[160px] border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2">
                <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-400 grid place-content-center">
                    T
                </div>
                <p class="overflow-hidden text-ellipsis">ofeiowajfoa</p>
            </div>
        </div>
        <div class="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-[calc(100%-2rem)] flex flex-col gap-2">
            <div class="bg-white py-1 px-1.5 rounded-xl w-[160px] border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2">
                <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-400 grid place-content-center">
                    T
                </div>
                <p class="overflow-hidden text-ellipsis">ofeiowajfoa</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import * as Monaco from "monaco-editor";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { onMounted, ref } from "vue";
import { Block } from "../model/block";

const props = defineProps<{
    blockID: string
    blockSettings: Block
}>()

const editorElement = ref<HTMLElement>()

window.MonacoEnvironment = {
    getWorker(id){
        return new tsWorker({ name: id })
    }
}

const code = `export default (
    arg1: string,
    arg2: number,
    arg3: object
) => {
    console.log("hey!")
    const a = 10
    const b = "ewioafjoiaw"
    return { a, b }
}`

function getBlockData(code: string) {
    let isArgs = false
    const args: { name: string, type: string }[] = []
    
    let isBody = false
    const bodyLines: string[] = []

    const codeLines = code.split("\n")
    codeLines.forEach((line, row) => {
        if( row == 0 ){
            isArgs = true
        }else if( line == ") => {" ){
            isArgs = false
            isBody = true
        }else if( row == code.split("\n").length - 2 ){
            isBody = false
        }else{
            if( isArgs ){
                const pairText = line[line.length-1] == "," ? line.slice(0, line.length-1) : line
                const [ name, type ] = pairText.trim().split(": ")
                args.push({name, type})
            }else if( isBody ){
                bodyLines.push(line.replace(/^(\t|    )/, ""))
            }
        }
    })

    const body = bodyLines.join("\n")

    const returnLine = codeLines[codeLines.length-2].replace(/\s+/g,'')
    const returnValues = returnLine.slice(7, returnLine.length-1).split(",")

    return {
        args,
        body,
        returnValues
    }
}

onMounted(async () => {
    if( !editorElement.value ) throw new Error("エディターが設定されてません！")

    console.log(getBlockData(code))

    const editor = Monaco.editor.create(editorElement.value, {
        language: "typescript",
        value: getBlockData(code).body,
        theme: "vs-dark",
        scrollBeyondLastLine: false,
        lineNumbers: "off",
        minimap: {
            enabled: false
        }
    })
})
</script>