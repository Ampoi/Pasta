<template>
  <div
    class="flex flex-col p-2 gap-2 w-[calc(100%+2rem)] h-40 bg-zinc-900 border-[1px] border-zinc-700 rounded-xl text-white">
    <input
      type="text"
      class="rounded-md border-[1px] border-zinc-700 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-zinc-500"
      placeholder="ブロックを検索...">
    <div class="grow flex flex-col gap-1 overflow-y-auto">
      <button
        class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg"
        @click="emit('selectBlock', 'code')">
        <div
          class="size-5 rounded-md grid place-content-center"
          :style="{ background: '#2563eb' }">
          <Icon
            icon="fluent:code-text-16-filled"
            class="text-xs"/>
        </div>
        <p class="text-sm">新規コード</p>
      </button>
      <button
        v-for="(block, blockID) in blocks"
        class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg"
        @click="emit('selectBlock', blockID)">
        <div
          class="size-5 rounded-md grid place-content-center"
          :style="{ background: block.icon.color }">
          <Icon
            :icon="block.icon.value"
            class="text-xs"/>
        </div>
        <p class="text-sm">{{ block.name }}</p>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Icon } from "@iconify/vue/dist/iconify.js";
import { getAllBlocks } from "../../utils/getAllBlocks";

const blocks = await getAllBlocks().then((blocks) => {
  const newBlocks = blocks;
  for (const [blockID, block] of Object.entries(blocks)) {
    if (block.trigger) {
      delete newBlocks[blockID];
    }
  }
  return newBlocks;
});

const emit = defineEmits<{
  (e: "selectBlock", blockID: string): void;
}>();
</script>