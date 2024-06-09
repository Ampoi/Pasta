<template>
    <div
        class="bg-black w-full h-full border-[1px] border-zinc-700"
        ref="editorElement">

    </div>
</template>
<script setup lang="ts">
import * as Monaco from "monaco-editor";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
import { constrainedEditor } from "constrained-editor-plugin"
import { code, codeID } from "../../hooks/code"
import { onMounted, ref, watch } from "vue";
import { getCodeData } from "../../utils/getCodeData";

const editorElement = ref<HTMLElement>()

function createModel(){
    const MonacoTypescript = Monaco.languages.typescript
    MonacoTypescript.typescriptDefaults.setCompilerOptions({
        ...MonacoTypescript.typescriptDefaults.getCompilerOptions(),
        target: MonacoTypescript.ScriptTarget.ES2020,
        moduleResolution: MonacoTypescript.ModuleResolutionKind.NodeJs,
    })

    if( code.value == undefined ) throw new Error("Code is undefined")
    if( codeID.value == undefined ) throw new Error("Code ID is undefined")

    const model = Monaco.editor.createModel(
        code.value,
        "typescript",
        Monaco.Uri.from({
            scheme: "file",
            path: `/${codeID.value}.ts`
        })
    )

    return model
}

function addEditingRestrictions(editor: Monaco.editor.IStandaloneCodeEditor){
    const constrainedInstance = constrainedEditor(Monaco)
    constrainedInstance.initializeIn(editor)
    
    if( code.value == undefined ) throw new Error("Code data is undefined")

    type CodeData = {
        args: {
            name: string;
            type: string;
        }[];
        bodyLinesRange: number[];
        outputs: {
            type: string;
            name: string;
        }[];
    }
    
    let codeData: CodeData | undefined = undefined
    
    try {
        codeData = getCodeData(code.value)
    }catch(e){
        console.warn("error while getting code data", e)
        const defaultCode = [
            "export default (",
            ") => {",
            "  return {}",
            "}"
        ].join("\n")
        code.value = defaultCode
        codeData = getCodeData(defaultCode)
        
        if( !model ) throw new Error("Model is not defined")
        model.setValue(defaultCode)
    }

    constrainedInstance.addRestrictionsTo(model, [
        {
            range: codeData.bodyLinesRange,
            allowMultiline: true
        }
    ])
}

window.MonacoEnvironment = {
    getWorker(id){
        console.log(id)
        return new tsWorker({ name: id })
    }
}

let model: Monaco.editor.ITextModel | undefined = undefined

const updateEditor = () => {
    if( model ){
        model.dispose()
    }
        
    try{
        model = createModel()
    }catch(e){
        console.error("error while creating model", e)
        return
    }

    model.onDidChangeContent(() => {
        if( !model ) return
        code.value = model.getValue()
    })

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
}

onMounted(async () => {
    updateEditor()
    watch(code, (_newCode, oldCode) => {
        if( oldCode == undefined ){
            updateEditor()
        }
    })
    watch(codeID, updateEditor)
})
</script>