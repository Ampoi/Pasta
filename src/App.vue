<template>
  <div class="w-screen h-screen flex flex-col bg-slate-950 text-white">
    <header
      data-tauri-drag-region
      class="flex flex-row items-end basis-12 p-2">
      <div class="basis-16"/>
      <input
        type="text"
        class="bg-transparent py-1 px-2 rounded-md outline-none">
    </header>
    <main class="m-2 mt-0 grow border-[1px] bg-slate-900 border-slate-600/80 rounded-md">
      <div
        v-for="block in blocks">
        {{ block.value }}
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { dialog, fs } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import {  ref, watch } from 'vue';

const blockPaths = ref<string[]>([])
type Block = {
  title?: string
  value: {
    argument: Record<string, string>
    code: string
    returnValue: Record<string, string>
  }
}
const blocks = ref<Block[]>()

function getSettings(code: string){
  let isPastaSetting = false
  const settings: Record<string, string> = {}
  code.split("\n").forEach((line) => {
    if( line == "// == PASTA START ==" ){
      isPastaSetting = true
    }else if( line == "// === PASTA END ===" ){
      isPastaSetting = false
    }else if( isPastaSetting ){
      const settingText = line.slice(3, line.length)
      
      let separateSymbolIndex: number | undefined = undefined
      for( let i = 0; i < settingText.length; i++ ){
        if( settingText.slice(i, i+2) == ": " ) separateSymbolIndex = i
      }
      if( typeof separateSymbolIndex != "number" ) throw new Error("分割シンボルを見つけられませんでした")
      console.log(separateSymbolIndex)

      const key = settingText.slice(0, separateSymbolIndex)
      const value = settingText.slice(separateSymbolIndex+2, settingText.length)
      settings[key] = value
    }
  })

  return settings
}

watch(blockPaths, async () => {
  blocks.value = await Promise.all(blockPaths.value.map(async (path) => {
    const value = await fs.readTextFile(path)
    
    const settings = getSettings(value)
    console.log(settings)

    return {
      title: settings.title,
      value: {
        argument: {},
        code: value,
        returnValue: {}
      }
    }
  }))
})

appWindow.listen("open", async () => {
  const path = await dialog.open({
    directory: true,
    multiple: false
  });
  if( typeof path != "string" ) throw new Error("パスが想定外の型です！　型：" + typeof path)
  
  try {
    const filePaths = (await fs.readDir(path)).map(file => file.path);
    blockPaths.value = filePaths
  } catch (error) {
    console.error('Error listing files in directory:', error);
  }
})
</script>