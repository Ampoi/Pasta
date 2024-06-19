<template>
  <div class="text-sm flex flex-col gap-2 w-full h-full bg-black border-zinc-700 border-[1px] rounded-md py-2 px-3 font-mono text-white">
    <div
      v-for="log in logs"
      class="bg-zinc-900 border-zinc-700 border-[1px] rounded-md py-2 px-3 whitespace-pre-line">
      {{ log.message }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { listen } from '@tauri-apps/api/event';
import { useLogs } from '../../utils/useLogs';

const { logs, addLog } = useLogs()

listen<string>("run_flow_output", (event) => {
  addLog({
    id: event.id,
    message: event.payload
  })
})
</script>