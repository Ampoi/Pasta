<template>
  <div class="flex flex-row items-center" ref="blockElement">
    <div class="flex flex-col gap-3 bg-zinc-900 p-4 border-[1px] border-zinc-700 rounded-xl">
      <div class="relative">
        <div class="absolute top-1/2 -left-12">
          <Port
            v-if="nodeID != 'trigger'"
            :nodeID
            name="default"
            v-model:selectedPort="selectedPort"
            portType="input"
            class="-translate-y-1/2"/>
        </div>
        <div class="flex flex-row items-center gap-2">
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
        </div>
      </div>
      <div
        class="flex flex-col gap-2"
        v-if="block?.inputs">
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
      </div>
    </div>

    <!--返り値-->
    <div class="flex flex-col gap-2 -ml-3">
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
import { ref, watch, watchEffect } from "vue";
import { Node } from "../model/node";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
import InputListItem from "./node/inputListItem.vue";
import Port from "./node/port.vue";
import { useBlock } from "../hooks/useBlock";
import { flowID, PortPlace } from "../hooks/flow";
import { useNodeRect } from "../utils/getNodeRect"

const props = defineProps<{
  nodeID: string
}>()

const node = defineModel<Node>("node", { required: true })

const { block, blockID } = (() => {
  if( node.value.code ) {
    throw new Error("🥺")
  }else{
    return useBlock(node.value.type)
  }
})()

watch(node, async (newNode) => {
  if( newNode.code ) return
  blockID.value = newNode.type
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

defineExpose({
  id: props.nodeID,
  getNodeRect
})
</script>
