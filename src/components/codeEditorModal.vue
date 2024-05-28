<template>
  <div class="absolute top-0 left-0 w-full h-full">
    <div
      class="w-full h-full"
      @click="emit('close')"/>
    <div class="absolute top-4 right-4 bg-zinc-900 h-[calc(100%-2rem)] border-zinc-700 border-[1px] rounded-xl w-1/2 flex flex-col gap-4 text-white p-4">
      <div class="flex flex-row items-start">
        <h1 class="text-3xl font-semibold grow overflow-hidden text-ellipsis">{{ blockID }}</h1>
        <button @click="emit('close')">
          <i class="bi bi-x text-3xl text-zinc-500"/>
        </button>
      </div>
      <div class="grow" ref="editorElement">

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import * as Monaco from "monaco-editor";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
//@ts-ignore
import { constrainedEditor } from "constrained-editor-plugin" //TODO:Typescriptの型定義を作成する
import { computed, onMounted, onUnmounted, ref } from "vue";
import { getCodeData }  from "../utils/getCodeData"
import { createCodeRef } from "../utils/createCodeRef";

const props = defineProps<{
    blockID: string
    flowID: string
    projectPath: string
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

window.MonacoEnvironment = {
    getWorker(id){
        return new tsWorker({ name: id })
    }
}

const { code } = createCodeRef(props.projectPath, props.flowID, props.blockID)

function createModel(){
    const MonacoTypescript = Monaco.languages.typescript
    MonacoTypescript.typescriptDefaults.setCompilerOptions({
        ...MonacoTypescript.typescriptDefaults.getCompilerOptions(),
        target: MonacoTypescript.ScriptTarget.ES2020,
        moduleResolution: MonacoTypescript.ModuleResolutionKind.NodeJs,
    })
    MonacoTypescript.typescriptDefaults.addExtraLib("declare module 'test/file1' { export interface Test {} }")

    const model = Monaco.editor.createModel(
        code.value,
        "typescript",
        Monaco.Uri.from({
            scheme: "file",
            path: `/${props.blockID}.ts`
        })
    )

    return model
}

const model = createModel()

const blockData = computed(() => getCodeData(code.value))

function addEditingRestrictions(editor: Monaco.editor.IStandaloneCodeEditor){
    const constrainedInstance = constrainedEditor(Monaco)

    constrainedInstance.initializeIn(editor)
    constrainedInstance.addRestrictionsTo(model, [
        {
          range: blockData.value.bodyLinesRange,
          allowMultiline: true
        }
    ])
}

const editorElement = ref<HTMLElement>()

onMounted(async () => {
  if( !editorElement.value ) throw new Error("エディターが設定されてません！")

  const editor = Monaco.editor.create(editorElement.value, {
      theme: "vs-dark",
      scrollBeyondLastLine: false,
      lineNumbers: "off",
      minimap: {
          enabled: false
      },
      model
  })

  addEditingRestrictions(editor)
})

onUnmounted(() => {
  model.dispose()
})

model.onDidChangeContent(() => {
    code.value = model.getValue()
})
</script>