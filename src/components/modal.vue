<template>
  <div
    class="bg-zinc-900 h-full border-zinc-700 border-l-[1px] text-white overflow-hidden p-2 flex flex-col gap-2"
    v-if="openedTab">
    <div class="pt-1 flex flex-row gap-2">
      <button @click="close">
        <Icon icon="fluent:dismiss-16-filled"/>
      </button>
    </div>
    <component :is="components[openedTab]"/>
  </div>
</template>
<script setup lang="ts">
import Logs from "./modal/log.vue"
import Code from "./modal/code.vue"
import { Icon } from "@iconify/vue/dist/iconify.js";

const components = { Logs, Code } as const

const openedTab = defineModel<keyof typeof components | undefined>("openedTab")
const close = () => {
  openedTab.value = undefined
}
</script>