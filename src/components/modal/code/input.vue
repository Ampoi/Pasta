<template>
  <div class="relative">
    <button
      class="flex flex-row gap-1.5 items-baseline bg-zinc-900 border-zinc-700 border-[1px] rounded-md px-1 py-1 select-none"
      @click="showInputEditorModal = !showInputEditorModal">
      <div
        class="size-4 bg-blue-500 rounded-[4px] text-xs grid place-content-center">
        {{ input.type[0].toUpperCase() }}
      </div>
      <p class="text-sm leading-none">{{ input.name }}</p>
    </button>
    <div
      v-if="showInputEditorModal"
      class="flex flex-col gap-2 absolute -bottom-1 translate-y-full z-20 left-1/2 -translate-x-1/2 bg-zinc-900 border-[1px] border-zinc-700 rounded-xl p-1.5">
      <div class="flex flex-row gap-1.5 items-center">
        <div class="size-6 bg-blue-500 rounded-lg grid place-content-center">
          {{ input.type[0].toUpperCase() }}
        </div>
        <input
          type="text"
          class="rounded-lg w-24 bg-transparent border-zinc-700 border-[1px] text-sm px-1 py-0.5 outline-none">
      </div>
      <button
        class="bg-red-500/30 text-sm text-red-500 font-semibold py-0.5 rounded-lg">
        削除
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const showInputEditorModal = ref(false);

defineProps<{
  input: {
    name: string;
    type: string;
  };
}>();
</script>