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
            ref="editor"
            class="h-[200px] rounded-md overflow-hidden"/>
    </div>
</template>
<script setup lang="ts">
import * as Monaco from "monaco-editor";
import { onMounted, ref } from "vue";

type Block = {
  title: string
  description?: string
  connectedTo: string[]
}

const props = defineProps<{
    blockID: string
    blockSettings: Block
}>()

const editor = ref<HTMLElement>()

onMounted(() => {
    if( !editor.value ) throw new Error("エディターが設定されてません！")
    Monaco.editor.create(editor.value, {
        language: "typescript",
        value: "console.log('Hello World!')",
        theme: "vs-dark",
        scrollBeyondLastLine: false,
        lineNumbers: "off",
        minimap: {
            enabled: false
        }
    })
})
</script>