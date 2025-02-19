<template>
  <div
    ref="blockElement"
    class="relative select-none">
    <div class="flex flex-col gap-3 bg-zinc-900 p-4 border-[1px] border-zinc-700 rounded-xl">
      <div class="relative">
        <div class="absolute top-1/2 -left-10">
          <Port
            v-if="nodeID != 'trigger'"
            v-model:selectedPort="selectedPort"
            :nodeID
            name="default"
            portType="input"
            class="-translate-y-1/2"/>
        </div>
        <div class="flex flex-row items-center gap-2">
          <div
            class="text-white size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content"
            :style="{ background: block?.icon.color }">
            <Icon
              :icon="block?.icon.value ?? 'fluent:question-16-filled'"
              class="text-lg"/>
          </div>
          <input
            v-model="node.title"
            type="text"
            class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow">
        </div>
      </div>
      <button
        v-if="node.code"
        class="border-[1px] border-zinc-700 p-4 rounded-xl flex flex-row gap-2 justify-center items-center text-zinc-500"
        @click="openCodeModal">
        <Icon
          icon="fluent:code-text-edit-20-filled"
          class="text-lg"/>
        <p>コードを編集する</p>
      </button>
      <div
        v-if="block?.inputs && block.inputs.length > 0"
        class="flex flex-col gap-2">
        <InputListItem
          v-for="(input, index) in block.inputs"
          v-model:selectedPort="selectedPort"
          v-model:node="node"
          :nodeID
          portType="input"
          :block="block"
          :index
          :blockInput="input"/>
      </div>
    </div>

    <!--返り値-->
    <div class="flex flex-col gap-2 -ml-3 absolute right-3 translate-x-full top-1/2 -translate-y-1/2">
      <Port
        v-model:selectedPort="selectedPort"
        :nodeID
        name="default"
        portType="output"/>
      <Port
        v-for="output in block?.outputs"
        v-model:selectedPort="selectedPort"
        :nodeID
        portType="output"
        :type="output.type"
        :name="output.name"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";
import { Node } from "../model/node";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
import InputListItem from "./node/inputListItem.vue";
import Port from "./node/port.vue";
import { useBlock } from "../hooks/useBlock";
import { flowID, PortPlace } from "../hooks/flow";
import { useNodeRect } from "../utils/getNodeRect"
import { useCodeBlock } from "../hooks/useCodeBlock";
import { codeID } from "../hooks/code";

const props = defineProps<{
  nodeID: string
}>()

const emit = defineEmits<{
  (e: "openCodeModal"): void
}>()

const node = defineModel<Node>("node", { required: true })

const { block, blockID } = (() => {
  if( node.value.code ) {
    return useCodeBlock(node.value.codeID)
  }else{
    return useBlock(node.value.blockID)
  }
})()

watch(node, async (newNode) => {
  if( newNode.code ) return
  blockID.value = newNode.blockID
})()

watchEffect(() => {
  if( !flowID.value ) return
  if (!ports[flowID.value]) ports[flowID.value] = {};

  const inputs = block.value?.inputs ?? [];
  const outputs = block.value?.outputs ?? [];

  ports[flowID.value][props.nodeID] = {
    inputs: inputs.map((input) => input.name),
    outputs: outputs.map((output) => output.name),
  };
});

const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })
const blockElement = ref<HTMLElement>();

const { getNodeRect, setupGetNode } = useNodeRect(blockElement)
setupGetNode()

const openCodeModal = () => {
  if( !node.value.code ) return

  emit('openCodeModal')
  codeID.value = node.value.codeID
}

defineExpose({
  id: props.nodeID,
  getNodeRect
})
</script>
