<template>
  <div class="absolute top-0 left-0 w-full h-full">
    <div
      class="w-full h-full"
      @click="close"/>
    <div class="absolute top-4 right-4 bg-zinc-900 h-[calc(100%-2rem)] border-zinc-700 border-[1px] rounded-xl w-1/2 flex flex-col text-white overflow-hidden">
      <div class="flex flex-row overflow-x-auto text-zinc-500">
        <button class="py-2 px-4 hover:bg-zinc-800 flex flex-row gap-1 items-center">
          <Icon
            icon="fluent:window-console-20-filled"
            class="text-xl"/>
          <p>ログ</p>
        </button>
      </div>
      <div class="border-t-[1px] border-zinc-700 p-2 grow">
        <div class="text-sm flex flex-col gap-2 w-full h-full bg-black border-zinc-700 border-[1px] rounded-md py-2 px-3 font-mono text-white">
          <div
            v-for="log in logs"
            class="bg-zinc-900 border-zinc-700 border-[1px] rounded-md py-2 px-3 whitespace-pre-line">
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { listen } from '@tauri-apps/api/event';
import { useLogs } from '../utils/useLogs';

const openedTab = defineModel<string | undefined>("openedTab")
const { logs, addLog } = useLogs()

listen<string>("run_flow_output", (event) => {
  addLog({
    id: event.id,
    message: event.payload
  })
})

const close = () => {
  openedTab.value = undefined
}
</script>