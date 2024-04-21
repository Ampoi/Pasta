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
        class="w-full h-full p-4 overflow-hidden"
        v-if="projectPath">
        <div class="flex flex-row gap-12 items-center">
          <div
            v-for="row in renderedBlockIDs"
            class="flex flex-col gap-10">
            <Block
              v-for="blockID in row"
              :blockID
              :blockSettings="project.blocks[blockID]"/>
          </div>
        </div>
      </div>
      <div
        class="w-full h-full grid place-content-center"
        v-else>
        <div class="flex flex-row gap-8 items-center">
          <button>Open</button>
          <button>Create</button>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import Block from './components/block.vue';
import { createLayers } from "./utils/createLayers"

const projectPath = ref<string>("aaaa")

type Block = {
  title: string
  description?: string
  connectedTo: string[]
}

const project: {
  blocks: Record<string, Block>
} = {
  blocks: {
    home: {
      title: "コマンドが呼び出されたとき",
      description: "aaaaaa",
      connectedTo: ["getDate"]
    },
    getDate: {
      title: "日付を取得",
      connectedTo: ["sendMessage"]
    },
    getWeather: {
      title: "天気を取得",
      description: "abbb",
      connectedTo: ["sendMessage"]
    },
    sendMessage: {
      title: "メッセージを送信",
      connectedTo: []
    }
  }
}

const renderedBlockIDs = computed(() => {
  const dependencies: Record<string, string[]> = {}
  Object.entries(project.blocks).forEach(([id, value]) => {
    dependencies[id] = value.connectedTo
  })
  return createLayers(dependencies)
})
</script>