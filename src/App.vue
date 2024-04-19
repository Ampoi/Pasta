<template>
  <div class="w-screen h-screen flex flex-col">
    <header
      data-tauri-drag-region
      class="flex flex-row items-end basis-12 p-2">
      <div class="basis-16"/>
      <input
        type="text"
        class="bg-transparent py-1 px-2 rounded-md outline-none">
    </header>
    <main class="m-2 mt-0 grow border-[1px] bg-gray-100 border-gray-200 rounded-md">
      <div
        class="w-full h-full p-4"
        v-if="projectPath">
        <Block
          v-for="block in blocks"
          :block/>
      </div>
      <div
        class="w-full h-full grid place-content-center"
        v-else>
        <div class="flex flex-row gap-8 items-center">
          <button
            @click="openProject">Open</button>
          <button>Create</button>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { dialog, fs } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { ref, watch } from 'vue';
import { getSettings } from './utils/getSettings';
import Block from './components/block.vue';

const projectPath = ref<string>()

type Block = {
  title?: string
  value: {
    argument: Record<string, string>
    code: string
    returnValue: Record<string, string>
  }
}
const blocks = ref<Block[]>()

watch(projectPath, async () => {
  if( !projectPath.value ) return

  const blockPaths = (await fs.readDir(projectPath.value)).map(file => file.path);
  blocks.value = await Promise.all(blockPaths.map(async (path) => {
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

async function openProject(){
  const path = await dialog.open({
    directory: true,
    multiple: false
  });
  if( typeof path != "string" ) throw new Error("パスが想定外の型です！　型：" + typeof path)
  projectPath.value = path
}

appWindow.listen("open", openProject)
</script>