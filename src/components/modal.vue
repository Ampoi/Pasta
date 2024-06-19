<template>
  <div
    v-if="openedTab"
    ref="modalElement"
    class="bg-zinc-900 h-full border-zinc-700 border-l-[1px] text-white overflow-hidden p-2 flex flex-col gap-2 relative max-w-[calc(100%-400px)]"
    :style="{ flexBasis: `${width}px` }">
    <div class="pt-1 flex flex-row gap-2">
      <button @click="close">
        <Icon icon="fluent:dismiss-16-filled"/>
      </button>
    </div>
    <component :is="components[openedTab]"/>
    <div class="w-1 h-16 bg-zinc-700 rounded-full absolute top-1/2 -translate-y-1/2 left-1 -translate-x-1/2"/>
    <div
      class="w-1 h-16 p-0.5 bg-white box-content rounded-full absolute top-1/2 -translate-y-1/2 left-1 -translate-x-1/2 opacity-0 hover:opacity-100 transition duration-200"
      @mousedown="isMouseDown = true"/>
  </div>
</template>
<script setup lang="ts">
import Logs from "./modal/log.vue"
import Code from "./modal/code.vue"
import { Icon } from "@iconify/vue/dist/iconify.js";
import { ref } from "vue";

const components = { Logs, Code } as const
const width = ref(600)

const isMouseDown = ref(false)
const resizeModal = (event: MouseEvent) => {
  if( !isMouseDown.value ) return
  width.value -= event.movementX
}

const modalElement = ref<HTMLElement | null>(null)

const stopResize = () => {
  isMouseDown.value = false
  
  if(!modalElement.value) throw new Error("modalElement is not defined")
  width.value = modalElement.value.getClientRects()[0].width
}

window.addEventListener("mouseup", stopResize)
window.addEventListener("mousemove", resizeModal)

const openedTab = defineModel<keyof typeof components | undefined>("openedTab")
const close = () => {
  openedTab.value = undefined
}
</script>