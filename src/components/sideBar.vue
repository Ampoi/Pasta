<template>
    <div class="basis-48 border-r-[1px] border-zinc-700 flex flex-col gap-4 text-zinc-500 px-2 pb-8 pt-[46px]">
      <div class="flex flex-col">
        <h2 class="font-semibold px-2">フロー</h2>
        <button
          v-for="id in flowIDs"
          class="flex flex-row gap-2 items-center py-2 px-3 hover:bg-zinc-800 rounded-lg"
          @click="() => select(id)">
          <Icon
            icon="fluent:flow-24-regular"
            class="text-zinc-500 text-lg"/>
          <p class="text-white grow whitespace-nowrap overflow-hidden text-ellipsis text-left text-sm">{{ id }}</p>
        </button>
      </div>
    </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { reactive, ref } from 'vue';
import { flowID, getFlowIDs } from "../hooks/flow"

const showModal = ref(false)
const flowIDs = reactive<string[]>(await getFlowIDs())
flowID.value = flowIDs[0]

const select = (id: string) => {
    flowID.value = id
    showModal.value = false
}
</script>