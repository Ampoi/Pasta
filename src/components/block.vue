<template>
    <div
        class="bg-white p-2 rounded-xl w-[520px] flex flex-col gap-2 border-gray-200 border-[1px] shadow-xl shadow-gray-300/40">
        <div class="flex flex-row">
        <input
            type="text"
            class="bg-gray-100 px-2 py-1 rounded-md outline-none">
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
  title?: string
  value: {
    argument: Record<string, string>
    code: string
    returnValue: Record<string, string>
  }
}

const props = defineProps<{
    block: Block
}>()

const editor = ref<HTMLElement>()

onMounted(() => {
    if( !editor.value ) throw new Error("エディターが設定されてません！")
    Monaco.editor.create(editor.value, {
        language: "typescript",
        value: props.block.value.code,
        theme: "vs-dark",
        scrollBeyondLastLine: false,
        lineNumbers: "off",
        minimap: {
            enabled: false
        }
    })
})
</script>