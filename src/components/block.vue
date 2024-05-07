<template>
  <div
    class="bg-white px-5 py-3 rounded-xl w-[400px] flex flex-col gap-2 border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 relative">
    <div class="flex flex-row items-center gap-2">
      <i class="bi bi-code-square text-lg"/>
      <input
        type="text"
        class="px-2 py-1 rounded-md outline-gray-200"
        :value="blockSettings.title"
      />
    </div>
    <div class="p-4 border-gray-200 text-gray-500 border-[1px] rounded-md flex flex-row items-center justify-center gap-2">
      <i class="bi bi-code-square text-lg"/>
      <p>コードを編集する</p>
    </div>

    <!--返り値-->
    <div class="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[calc(100%-0.8rem)] flex flex-col items-start gap-2 max-w-[160px]">
      <div class="bg-white p-1.5 rounded-xl border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
      </div>
      <Port
        v-for="returnValue in returnValues"
        :blockID
        :type="returnValue.type"
        :name="returnValue.name"
      />
    </div>

    <!--引数-->
    <div
      class="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-[calc(100%-0.8rem)] flex flex-col items-end gap-2 max-w-[160px]"
    >
      <div
        class="bg-white p-1.5 rounded-xl border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2"
      >
        <div
          class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"
        />
      </div>
      <Port
        v-for="arg in args"
        :blockID
        :type="arg.type"
        :name="arg.name"
        :reverse="true"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Block } from "../model/block";
import Port from "./block/port.vue"

const props = defineProps<{
    blockID: string
    blockSettings: Block
}>()

type Port = {
  type: string
  name: string
}

const args: Port[] =  [
    { type: "string", name: "arg1" },
    { type: "number", name: "arg2" }
]

const returnValues: Port[] =  [
  { type: "string", name: "a" },
  { type: "number", name: "b" }
]
</script>