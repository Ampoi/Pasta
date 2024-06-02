<template>
  <div class="flex flex-row" ref="block">
    <!--引数-->
    <div
      class="flex flex-col items-end gap-2 max-w-[160px] -mr-2 z-10 my-auto py-3"
      v-if="nodeID != 'trigger'"
    >
      <Port
        :selected="isPortSelected('input', 'default')"
        :defaultPort="true"
        @click="() => onPortClick('input', 'default')"/>
      <Port
        v-for="input in blockData?.inputs"
        :selected="isPortSelected('input', input.name)"
        :reverse="true"
        :type="input.type"
        :name="input.name"
        @click="() => onPortClick('input', input.name)"/>
    </div>

    <div
      class="flex flex-col justify-center gap-2 grow bg-zinc-900 p-3 rounded-xl w-80 border-zinc-700 border-[1px]"
    >
      <div class="flex flex-row items-center gap-2">
        <div
          class="text-white size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content"
          :style="{ background: blockData?.icon.color }"
        >
          <Icon
            :icon="blockData?.icon.value ?? 'fluent:question-16-filled'"
            class="text-lg"
          />
        </div>
        <input
          type="text"
          class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow"
          :value="node.title"
        />
      </div>
      <div
        class="grow border-zinc-700 text-zinc-500 border-[1px] rounded-md flex flex-col justify-center p-2 gap-2"
        v-if="blockData && 0 < (blockData.inputs?.length ?? 0)">
        <div
          v-for="setting in blockData.inputs"
          class="flex flex-row gap-2 items-center text-sm">
          <p class="basis-20 whitespace-nowrap text-ellipsis overflow-hidden">
            {{ setting.name }}
          </p>
          <input
            type="number"
            class="px-2 py-1 border-[1px] rounded-sm border-zinc-700 bg-transparent grow"
          />
        </div>
      </div>
    </div>

    <!--返り値-->
    <div
      class="flex flex-col items-start gap-2 max-w-[160px] -ml-2 z-10 my-auto py-3"
    >
      <Port
        :selected="isPortSelected('output', 'default')"
        :defaultPort="true"
        @click="() => onPortClick('output', 'default')"/>
      <Port
        v-for="output in blockData?.inputs"
        :selected="isPortSelected('output', output.name)"
        :reverse="true"
        :type="output.type"
        :name="output.name"
        @click="() => onPortClick('output', output.name)"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { Node } from "../model/node";
import { Block } from "../model/block";
import Port from "./node/port.vue";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
import { Rect } from "../model/utils";
import { Callback } from "../model/utils";
import { readTextFile } from "@tauri-apps/api/fs";
import { PortPlace } from "../utils/connectPorts";
import { projectPath } from "../utils/projectPath";

const props = defineProps<{
  nodeID: string;
  flowID: string;
}>()

const node = defineModel<Node>("node", { required: true })

const emit = defineEmits<{
  (e: "connectPorts", from: PortPlace, to: PortPlace): void
}>()

type Port = {
  type: string;
  name: string;
};

const block = ref<HTMLElement>();
const blockPath = computed(() => `${projectPath.value}/blocks/${node.value.type}/block.json`);
const blockData = ref<Block | undefined>();
watch(node, async () => {
  try {
    const fileText = await readTextFile(blockPath.value);
    const fileJSON = JSON.parse(fileText) as Block;
    blockData.value = fileJSON;
  } catch (error) {
    console.warn(error);
  }
}, { immediate: true })()

watchEffect(() => {
  if (!ports[props.flowID]) ports[props.flowID] = {};

  const inputs = blockData.value?.inputs ?? [];
  const outputs = blockData.value?.outputs ?? [];

  ports[props.flowID][props.nodeID] = {
    inputs: inputs.map((input) => input.name),
    outputs: outputs.map((output) => output.name),
  };
});

let isMounted = false
let getNodeRectQue: (() => void) | undefined = undefined

const getNodeRect = (callback: Callback<Rect> ) => {
  if( !isMounted ){
    getNodeRectQue = () => getNodeRect(callback)
  }else{
    const blockElement = block.value;
    if( !blockElement ) throw new Error("blockElement is not defined")
    callback({
      height: blockElement.clientHeight,
      width: blockElement.clientWidth,
    })
  }
}

onMounted(() => {
  isMounted = true
  if( getNodeRectQue ){
    getNodeRectQue()
    getNodeRectQue = undefined
  }
})

const selectedPort = defineModel<PortPlace | null>("selectedPort")

const onPortClick = (type: "input" | "output", portID: string) => {
  const clickedPort = {
    type,
    blockID: props.nodeID,
    portID
  }

  if( !selectedPort.value ){
    selectedPort.value = clickedPort
  }else{
    if( clickedPort.type == "input" ){
      emit("connectPorts", selectedPort.value, clickedPort)
    }else{
      emit("connectPorts", clickedPort, selectedPort.value)
    }
    selectedPort.value = null
  }
}

const isPortSelected = (type: "input" | "output", portID: string): boolean => (
  !!(selectedPort.value) &&
  (type == selectedPort.value.type) &&
  (props.nodeID == selectedPort.value.blockID) &&
  (portID == selectedPort.value.portID)
)

defineExpose({
  id: props.nodeID,
  getNodeRect
})
</script>
