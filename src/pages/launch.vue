<template>
    <main class="w-screen h-screen bg-zinc-900 relative grid place-content-center">
      <header
        data-tauri-drag-region
        @dblclick="maximizeWindow"
        class="h-[46px] w-full absolute top-0 left-0"
      />
      <div class="text-zinc-600 flex flex-col gap-4 items-center">
        <h1 class="text-6xl font-semibold">Pasta</h1>
        <div class="flex flex-row gap-4">
          <button class="py-2 px-3 border-[1px] border-zinc-700 rounded-2xl flex flex-row items-center gap-2">
            <i class="bi bi-plus-square"/>
            <p>新規プロジェクト</p>
          </button>
          <button
            class="py-2 px-3 border-[1px] border-zinc-700 rounded-2xl flex flex-row items-center gap-2"
            @click="emit('openProject')">
            <i class="bi bi-folder2"/>
            <p>プロジェクトを開く</p>
          </button>
        </div>
      </div>
    </main>
</template>
<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window';

const emit = defineEmits<{
    (e: "openProject"): void
}>()

const maximizeWindow = () => {
    appWindow.maximize()
}
</script>