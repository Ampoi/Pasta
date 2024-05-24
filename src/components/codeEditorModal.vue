<template>
  <div class="absolute top-0 left-0 w-full h-full">
    <div
      class="w-full h-full"
      @click="blockID = undefined"/>
    <div class="absolute top-4 right-4 bg-zinc-900 h-[calc(100%-2rem)] border-zinc-700 border-[1px] rounded-xl w-[calc(100%-500px)] flex flex-col gap-4 text-white p-4">
      <div class="flex flex-row items-start">
        <h1 class="text-3xl font-semibold grow overflow-hidden text-ellipsis">{{ blockID }}</h1>
        <button @click="blockID = undefined">
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
import { constrainedEditor } from "constrained-editor-plugin"
import { computed, onMounted, onUnmounted, ref } from "vue";

const blockID = defineModel<string | undefined>("blockID", { required: true })

window.MonacoEnvironment = {
    getWorker(id){
        return new tsWorker({ name: id })
    }
}

const code = ref(`export default (
    arg1: string,
    arg2: number,
    arg3: object
) => {
    console.log("hey!")
    const a = 10
    const b = "ewioafjoiaw"
    return { a, b }
}`)

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
            path: `/${blockID}.ts`
        })
    )

    return model
}

const model = createModel()

const blockData = computed(() => {
  let isArgs = false
  const args: { name: string, type: string }[] = []

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
})

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