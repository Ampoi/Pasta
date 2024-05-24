<template>
  <div class="w-screen h-screen flex flex-col bg-zinc-900">
    <header
      data-tauri-drag-region
      class="flex flex-row items-center p-1.5"
      @dblclick="maximizeWindow">
      <div class="basis-32"></div>
      <input
        type="text"
        class="bg-transparent py-1 px-2 rounded-md outline-none border-[1px] border-zinc-700 bg-zinc-950 basis-60 font-bold text-white">
    </header>
    <main class="grow border-t-[1px] bg-zinc-950 border-zinc-700 relative">
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
                <div
                  v-if="!blockID"
                  class="h-40"/>
                <BlockComponent
                  v-else
                  :isTrigger="blockID == 'trigger'"
                  :blockID
                  :blockSettings="
                    blockID == 'trigger'
                      ? project.trigger
                      : project.blocks[blockID]"/>
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
import { Project } from "./model/project"
import { appWindow } from '@tauri-apps/api/window';

const projectPath = ref<string>("aaaa")

const maximizeWindow = (event: MouseEvent) => {
  event.preventDefault()
  appWindow.maximize()
}

const project = reactive<Project>({
  trigger: {
    title: "trigger",
    ports: {
      returnValues: ["a", "b"]
    },
    connectedPorts: {
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
        args: ["arg1", "arg2"],
        returnValues: ["a", "b"]
      },
      connectedPorts: {
        a: {
          B: "arg1"
        }
      }
    },
    B: {
      title: "Bbbb",
      ports: {
        args: ["arg1", "arg2"],
        returnValues: ["a", "b"]
      },
      connectedPorts: {}
    }
  }
})

const renderedBlockIDs = computed(() => {
  return createLayers(project)
})
</script>