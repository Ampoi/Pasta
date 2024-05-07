<template>
  <div class="w-screen h-screen flex flex-col">
    <header
      data-tauri-drag-region
      class="flex flex-row items-end justify-center basis-12 p-2">
      <input
        type="text"
        class="bg-transparent py-1 px-2 rounded-md outline-none border-[1px] border-gray-200 basis-80 text-center">
    </header>
    <main class="m-2 mt-0 grow border-[1px] bg-gray-100 border-gray-200 rounded-md relative">
      <DraggableArea
        v-if="projectPath"
        class="w-full h-full p-4">
        <div class="relative">
          <div class="flex flex-row gap-60 items-center">
            <div
              v-for="row in renderedBlockIDs"
              class="flex flex-col gap-10">
              <div
                v-for="blockID in row">
                <TriggerBlockComponent
                  v-if="blockID == 'trigger'"
                  :blockID
                  :blockSettings="project.trigger"/>
                <BlockComponent
                  v-else-if="blockID"
                  :blockID
                  :blockSettings="project.blocks[blockID]"/>
                <div
                  v-else
                  class="h-40"/>
              </div>
            </div>
          </div>
          <Lines
            class="-z-10"
            :project/>
        </div>
      </DraggableArea>
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
import BlockComponent from './components/block.vue';
import { computed, reactive, ref } from 'vue';
import { createLayers } from "./utils/createLayers"
import Lines from "./components/lines.vue"
import DraggableArea from "./components/draggableArea.vue"
import TriggerBlockComponent from "./components/triggerBlock.vue"
import { Project } from "./model/project"

const projectPath = ref<string>("aaaa")

const project = reactive<Project>({
  trigger: {
    title: "trigger",
    ports: {
      a: {
        A: "arg1"
      },
      b: {
        B: "arg2"
      }
    }
  },
  blocks: {
    A: {
      title: "Aaaa",
      ports: {
        a: {
          B: "arg1"
        }
      }
    },
    B: {
      title: "Bbbb",
      ports: {}
    }
  }
})

const renderedBlockIDs = computed(() => {
  return createLayers(project)
})
</script>