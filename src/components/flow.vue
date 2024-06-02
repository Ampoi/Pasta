<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="blockID in row">
          <div v-if="!blockID" class="h-40" />
          <Suspense v-else>
            <NodeComponent
              :blockID
              :blockSettings="flow.nodes[blockID]"
              :flowID="id"
              :ref="(el: any) => { nodes[el.id] = el }"
              v-model:selected-port="selectedPort"
              @connect-ports="connectPorts"/>
          </Suspense>
        </div>
      </div>
    </div>
    <Lines
      class="-z-10"
      :flow
      :flowID="id"
      @getNodeRect="getNodeRect"/>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { createLayers } from '../utils/createLayers';
import Lines from './lines.vue';
import NodeComponent from './node.vue';
import { writeTextFile } from '@tauri-apps/api/fs';
import { Callback } from "../model/utils"
import { PortPlace, addPortConnection } from '../utils/connectPorts';
import { createRunnableCode } from '../utils/createRunnableCode';
import { projectPath } from '../utils/projectPath';
import { Rect } from "../model/utils"
import { invoke } from '@tauri-apps/api';
import { getAllBlocks } from '../utils/getAllBlocks';
import { useFlow } from '../hooks/useFlow';

const props = defineProps<{
  id: string
}>()

const { flow, flowID } = useFlow(props.id)
watch(() => props.id, (newID) => {
  flowID.value = newID
})

const nodes = reactive<{ [nodeID: string]: InstanceType<typeof NodeComponent> }>({})

const getNodeRect = (nodeID: string, callback: Callback<Rect>) => {
  try {
    nodes[nodeID].getNodeRect(callback)
  } catch (error) {
    console.warn(`an error occurred on blockID: ${nodeID}:\n${error}`)
  }
}

const renderedBlockIDs = computed(() => {
  return createLayers(flow.value);
});

const selectedPort = ref<PortPlace | null>(null)

const connectPorts = (from: PortPlace, to: PortPlace) => {
  const newFlow = addPortConnection(flow.value, from, to)
  if( newFlow ) {
    flow.value = newFlow
  }
}

const modalOpenedTab = defineModel<string | undefined>("modalOpenedTab")

const runFlow = async () => {
  modalOpenedTab.value = "logs"
  const blocks = await getAllBlocks()
  const code = createRunnableCode(flow.value, blocks)
  await writeTextFile(`${projectPath.value}/pasta/${props.id}.ts`, code) //TODO:`.pasta`にする
  await invoke("run_flow", {
    projectPath: projectPath.value,
    flowId: props.id
  })
}

defineExpose({ runFlow })
</script>