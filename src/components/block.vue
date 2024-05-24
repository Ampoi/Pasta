<template>
  <div class="flex flex-row" ref="block">
    <!--引数-->
    <div
      class="flex flex-col items-end gap-2 max-w-[160px] -mr-2 z-10 my-auto py-3"
      v-if="!isTrigger">
      <div class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] flex flex-row items-center gap-2">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
      </div>
      <Port
        v-for="arg in blockSettings.ports.args"
        :blockID
        :type="arg/*.type*/"
        :name="arg/*.name*/"
        :reverse="true"
      />
    </div>
    
    <div class="flex flex-col gap-2 grow bg-zinc-900 p-3 rounded-xl w-80 border-zinc-700 border-[1px]">
      <div class="flex flex-row items-center gap-2">
        <i class="bi bi-code-square text-lg text-white"/>
        <input
          type="text"
          class="px-2 py-1 rounded-md bg-transparent outline-zinc-700 text-white"
          :value="blockSettings.title"
        />
      </div>
      <button
        class="grow p-4 border-zinc-700 text-zinc-500 border-[1px] rounded-md flex flex-row items-center justify-center gap-2 select-none"
        @click="emit('openCodeModal')">
        <i class="bi bi-code-square text-lg"/>
        <p>コードを編集する</p>
      </button>
    </div>

    <!--返り値-->
    <div class="flex flex-col items-start gap-2 max-w-[160px] -ml-2 z-10 my-auto py-3">
      <div class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] flex flex-row items-center gap-2">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
      </div>
      <Port
        v-for="returnValue in blockSettings.ports.returnValues"
        :blockID
        :type="returnValue/*.type*/"
        :name="returnValue/*.name*/"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Block } from "../model/block";
import Port from "./block/port.vue"
import { updateBlockRect } from "../utils/blockRects"

const props = defineProps<{
    isTrigger: boolean
    blockID: string
    blockSettings: Block
}>()

const emit = defineEmits<{
  (e: "openCodeModal"): void
}>()

type Port = {
  type: string
  name: string
}

const block = ref<HTMLElement>()

onMounted(() => {
  updateBlockRect(props.blockID, block.value)
})
</script>