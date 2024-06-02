<template>
  <div class="flex flex-row" ref="blockElement">
    <table class="table-auto">
      <tbody>
        <tr>
          <td>
            <Port
              v-if="nodeID != 'trigger'"
              :nodeID
              name="default"
              v-model:selectedPort="selectedPort"
              portType="input"/>
          </td>
          <td
            class="flex flex-row -ml-3 items-center gap-2 py-3 bg-zinc-900 px-4 border-t-[1px] border-x-[1px] border-zinc-700 rounded-t-xl -mr-3"
            :class="{
              'rounded-b-xl border-b-[1px]': (block?.inputs?.length ?? 0) == 0
            }">
            <div
              class="text-white size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content"
              :style="{ background: block?.icon.color }"
            >
              <Icon
                :icon="block?.icon.value ?? 'fluent:question-16-filled'"
                class="text-lg"
              />
            </div>
            <input
              type="text"
              class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow"
              v-model="node.title"
            />
          </td>
        </tr>
        <InputListItem
          v-if="nodeID != 'trigger' && block && block.inputs"
          v-for="(input, index) in block.inputs"
          :nodeID
          v-model:selectedPort="selectedPort"
          portType="input"
          :block="block"
          :index
          :blockInput="input"
          v-model:node="node"/>
      </tbody>
    </table>

    <!--返り値-->
    <div class="flex flex-col gap-2 max-w-[160px] z-10 my-auto py-3">
      <Port
        :nodeID
        name="default"
        v-model:selectedPort="selectedPort"
        portType="output"/>
      <Port
        v-for="output in block?.outputs"
        :nodeID
        v-model:selectedPort="selectedPort"
        portType="output"
        :type="output.type"
        :name="output.name"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { Node } from "../model/node";
import { Block } from "../model/block";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
import { Rect } from "../model/utils";
import { Callback } from "../model/utils";
import { readTextFile } from "@tauri-apps/api/fs";
import { PortPlace } from "../utils/connectPorts";
import { projectPath } from "../utils/projectPath";
import InputListItem from "./node/inputListItem.vue";
import Port from "./node/port.vue";

const props = defineProps<{
  nodeID: string;
  flowID: string;
}>()

const emit = defineEmits<{
  (e: "connectPorts", from: PortPlace, to: PortPlace): void
}>()

const blockElement = ref<HTMLElement>();
const blockPath = computed(() => `${projectPath.value}/blocks/${node.value.type}/block.json`);
const block = ref<Block | undefined>();

const node = defineModel<Node>("node", { required: true })
watch(node, async () => {
  try {
    const fileText = await readTextFile(blockPath.value);
    const fileJSON = JSON.parse(fileText) as Block;
    block.value = fileJSON;
  } catch (error) {
    console.warn(error);
  }
}, { immediate: true })()

watchEffect(() => {
  if (!ports[props.flowID]) ports[props.flowID] = {};

  const inputs = block.value?.inputs ?? [];
  const outputs = block.value?.outputs ?? [];

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
    const blockElementValue = blockElement.value;
    if( !blockElementValue ) throw new Error("blockElement is not defined")
    callback({
      height: blockElementValue.clientHeight,
      width: blockElementValue.clientWidth,
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

const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })

defineExpose({
  id: props.nodeID,
  getNodeRect
})
</script>
