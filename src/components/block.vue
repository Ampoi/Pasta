<template>
    <div
        class="bg-white p-2 rounded-xl w-[520px] flex flex-col gap-2 border-gray-200 border-[1px] shadow-xl shadow-gray-300/40">
        <div class="flex flex-row">
        <input
            type="text"
            class="bg-gray-100 px-2 py-1 rounded-md outline-none"
            :value="blockSettings.title">
        </div>
        <div
            ref="editorElement"
            class="h-[200px] rounded-md overflow-hidden"/>
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

//async function getBlockData(code: string)/*: {
//    parameters: { name: string, type: string }[]
//    body: string
//    returnType: string
//}*/ {
//    const model = Monaco.editor.createModel(code, "typescript")
//    const worker = await Monaco.languages.typescript.getTypeScriptWorker()
//    const client = await worker(model.uri)
//
//    const ast = await client.getNavigationTree(model.uri.toString());
//    console.log(ast)
//
//    return {
//
//    }
//}

onMounted(() => {
    if( !editorElement.value ) throw new Error("エディターが設定されてません！")

    const editor = Monaco.editor.create(editorElement.value, {
        language: "typescript",
        value: code,
        theme: "vs-dark",
        scrollBeyondLastLine: false,
        lineNumbers: "off",
        minimap: {
            enabled: false
        }
    })

    //getBlockData(code)
})
</script>