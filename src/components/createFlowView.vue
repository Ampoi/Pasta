<template>
    <div class="grid place-content-center">
        <div class="flex flex-col gap-4 items-center text-zinc-500">
          <h2 class="text-5xl font-semibold">フローを作成</h2>
          <input
            type="text"
            class="px-2 py-1 bg-transparent border-[1px] border-zinc-700 rounded-lg text-center placeholder:text-zinc-700 outline-none"
            placeholder="フロー名"
            v-model="flowName">
          <button
            class="text-black bg-zinc-500 py-2 px-4 rounded-lg font-semibold"
            @click="createFlowWithID">
            作成する
          </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { createFlow } from '../hooks/flow';

const flowName = ref("");

const createFlowWithID = async () => {
    await createFlow(flowName.value)
}
</script>