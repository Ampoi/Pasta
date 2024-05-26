<template>
  <div class="flex flex-row" ref="block">
    <!--引数-->
    <div
      class="flex flex-col items-end gap-2 max-w-[160px] -mr-2 z-10 my-auto py-3"
      v-if="blockID != 'trigger'">
      <div class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] flex flex-row items-center gap-2">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
      </div>
      <Port
        v-for="arg in blockData.args"
        :blockID
        :type="arg.type"
        :name="arg.name"
        :reverse="true"
      />
    </div>
    
    <div class="flex flex-col gap-2 grow bg-zinc-900 p-3 rounded-xl w-80 border-zinc-700 border-[1px]">
      <div class="flex flex-row items-center gap-2">
        <div class="text-white bg-blue-500 size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content">
          <Icon icon="fluent:code-text-16-filled" class="text-lg"/>
        </div>
        <input
          type="text"
          class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow"
          :value="blockSettings.title"
        />
      </div>
      <div class="grow border-zinc-700 text-zinc-500 border-[1px] rounded-md flex flex-col">
        <button
          class="grow p-4 flex flex-row items-center justify-center gap-2 select-none"
          @click="emit('openCodeModal')">
          <Icon icon="fluent:code-text-edit-20-filled" class="text-lg"/>
          <p>コードを編集する</p>
        </button>
      </div>
    </div>

    <!--返り値-->
    <div class="flex flex-col items-start gap-2 max-w-[160px] -ml-2 z-10 my-auto py-3">
      <div class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] flex flex-row items-center gap-2">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
      </div>
      <Port
        v-for="returnValue in blockData.returnValues"
        :blockID
        :type="returnValue.type"
        :name="returnValue.name"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import { Block } from "../model/block";
import Port from "./block/port.vue"
import { updateBlockRect } from "../utils/blockRects"
import { getBlockData } from "../utils/getBlockData";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";

const props = defineProps<{
    blockID: string
    blockSettings: Block
    flowIndex: number
    projectPath: string
}>()

const emit = defineEmits<{
  (e: "openCodeModal"): void
}>()

type Port = {
  type: string
  name: string
}

const block = ref<HTMLElement>()

const defaultCode = `export default (
    arg1: string,
    arg2: number,
    arg3: object
) => {
    console.log("hey!")
    const a = 10
    const b = "ewioafjoiaw"
    return { a, b }
}`

const code = ref(defaultCode)

const blockData = computed(() => getBlockData(code.value))

watchEffect(() => {
  if( !ports[props.flowIndex] ) ports[props.flowIndex] = {}

  ports[props.flowIndex][props.blockID] = {
    args: blockData.value.args.map(arg => arg.name),
    returnValues: blockData.value.returnValues.map(returnValue => returnValue.name)
  }
})

onMounted(() => {
  updateBlockRect(props.blockID, block.value)
})
</script>