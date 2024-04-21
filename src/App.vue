<template>
  <div class="w-screen h-screen flex flex-col">
    <header
      data-tauri-drag-region
      class="flex flex-row items-end justify-center basis-12 p-2">
      <input
        type="text"
        class="bg-transparent py-1 px-2 rounded-md outline-none border-[1px] border-gray-200 basis-80 text-center">
    </header>
    <main class="m-2 mt-0 grow border-[1px] bg-gray-100 border-gray-200 rounded-md">
      <div
        class="w-full h-full p-4 overflow-hidden"
        v-if="projectPath">
        <div class="flex flex-row gap-12 items-center">
          <div
            v-for="row in renderedBlockIDs"
            class="flex flex-col gap-10">
            <BlockComponent
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
import { computed, reactive, ref } from 'vue';
import BlockComponent from './components/block.vue';
import { createLayers } from "./utils/createLayers"
import { Block } from "./model/block"

const projectPath = ref<string>("aaaa")

const project: {
  blocks: Record<string, Block>
} = reactive({
  blocks: {
    home: {
      title: "コマンドが呼び出されたとき",
      description: "aaaaaa",
      connectedTo: {
        getDate: ["default"],
        getWeather: ["city"]
      }
    },
    getDate: {
      title: "日付を取得",
      connectedTo: {
        sendMessage: ["date"]
      }
    },
    getWeather: {
      title: "天気を取得",
      description: "abbb",
      connectedTo: {
        sendMessage: ["weather"]
      }
    },
    sendMessage: {
      title: "メッセージを送信",
      connectedTo: {}
    }
  }
})

const renderedBlockIDs = computed(() => {
  const dependencies: Record<string, string[]> = {}
  Object.entries(project.blocks).forEach(([id, value]) => {
    dependencies[id] = Object.keys(value.connectedTo)
  })
  return createLayers(dependencies)
})
</script>