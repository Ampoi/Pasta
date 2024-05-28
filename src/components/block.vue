<template>
  <div class="flex flex-row" ref="block">
    <!--引数-->
    <div
      class="flex flex-col items-end gap-2 max-w-[160px] -mr-2 z-10 my-auto py-3"
      v-if="blockID != 'trigger'">
      <Port :defaultPort="true" />
      <Port
        v-for="arg in blockData?.input"
        :blockID
        :type="arg.type"
        :name="arg.name"
        :reverse="true"/>
    </div>

    <div class="flex flex-col justify-center gap-2 grow bg-zinc-900 p-3 rounded-xl w-80 border-zinc-700 border-[1px]">
      <div class="flex flex-row items-center gap-2">
        <div
          class="text-white size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content"
          :style="{ background: blockData?.icon.color }">
          <Icon
            :icon="blockData?.icon.value ?? 'fluent:question-16-filled'"
            class="text-lg"/>
        </div>
        <input
          type="text"
          class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow"
          :value="blockSettings.title"
        />
      </div>
      <div
        class="grow border-zinc-700 text-zinc-500 border-[1px] rounded-md flex flex-col justify-center"
        v-if="blockData && 0 < blockData.settings.length">
        <div
          v-for="setting in blockData?.settings"
          class="flex flex-row gap-2 items-center text-sm p-2">
          <p class="basis-20 whitespace-nowrap text-ellipsis overflow-hidden">{{ setting.name }}</p>
          <input
            type="number"
            class="px-2 py-1 border-[1px] rounded-sm border-zinc-700 bg-transparent grow">
        </div>
      </div>
    </div>

    <!--返り値-->
    <div class="flex flex-col items-start gap-2 max-w-[160px] -ml-2 z-10 my-auto py-3">
      <Port :defaultPort="true" />
      <Port
        v-for="returnValue in blockData?.output"
        :blockID
        :type="returnValue.type"
        :name="returnValue.name"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { /*computed, */onMounted, ref, watchEffect } from "vue";
import { Block } from "../model/block";
import Port from "./block/port.vue";
import { updateBlockRect } from "../utils/blockRects";
//import { getBlockData } from "../utils/getBlockData";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
//import { createCodeRef } from "../utils/createCodeRef";

const props = defineProps<{
  blockID: string;
  blockSettings: Block;
  flowID: string;
  projectPath: string;
}>();

//const emit = defineEmits<{
//  (e: "openCodeModal"): void;
//}>();

type Port = {
  type: string;
  name: string;
};

const block = ref<HTMLElement>();
//const { code } = createCodeRef(props.projectPath, props.flowIndex, props.blockID)
type Value = {
  name: string
  type: string
}
type BlockData = {
  name: string
  description: string
  icon: {
    value: string
    color: string
  }
  input: Value[]
  output: Value[]
  settings: Value[]
  execute: (
    input: Record<string, unknown>,
    settings: Record<string, unknown>
  ) => Record<string, unknown>
}

const blockData = ref<BlockData | undefined>({
  name: "加算",
  description: "2つの数値を足し合わせます。",
  icon: {
    value: "fluent:add-12-filled",
    color: "#FF8F1B"
  },
  input: [
    { name: "a", type: "number" },
    { name: "b", type: "number" },
  ],
  output: [{ name: "result", type: "number" }],
  settings: [{
    name: "bias",
    type: "string"
  }],
  execute: ({ a, b }) => {
    const result = a + b
    return { result }
  },
});
//const blockData = computed(() => getBlockData(code.value))

watchEffect(() => {
  if (!ports[props.flowIndex]) ports[props.flowIndex] = {};
  
  const input = blockData.value?.input ?? [];
  const output = blockData.value?.output ?? [];
  ports[props.flowIndex][props.blockID] = {
    args: input.map((arg) => arg.name),
    returnValues: output.map((returnValue) => returnValue.name),
  };
});

onMounted(() => {
  updateBlockRect(props.blockID, block.value);
});
</script>
