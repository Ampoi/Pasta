<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="layer in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="nodeID in layer">
          <div v-if="!nodeID" class="h-40" />
          <Suspense v-else>
            <NodeComponent
              :nodeID
              v-model:node="flow.nodes[nodeID]"
              :ref="(el: any) => {
                if(el){nodes[el.id] = el}
              }"
              v-model:selected-port="selectedPort"
              @open-code-modal="emit('openCodeModal')"/>
          </Suspense>
        </div>
      </div>
    </div>
    <Lines
      class="-z-10"
      @getNodeRect="getNodeRect"/>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { createLayers } from '../utils/createLayers';
import Lines from './lines.vue';
import NodeComponent from './node.vue';
import { createDir, exists, writeTextFile } from '@tauri-apps/api/fs';
import { Callback } from "../model/utils"
import { createRunnableCode } from '../utils/createRunnableCode';
import { projectPath } from '../utils/projectPath';
import { Rect } from "../model/utils"
import { invoke } from '@tauri-apps/api';
import { getAllBlocks } from '../utils/getAllBlocks';
import { flow, flowID, connectPorts, PortPlace } from '../hooks/flow';

const emit = defineEmits<{
  (e: "openCodeModal"): void
  (e: "openLogsModal"): void
}>()

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

watch(selectedPort, (newValue, oldValue) => {
  if( !newValue || !oldValue ) return
  
  if( newValue.type == "input" ) {
    connectPorts(oldValue, newValue)
  }else{
    connectPorts(newValue, oldValue)
  }
  selectedPort.value = null
})

//TODO: flow.tsに移動
const runFlow = async () => {
  emit('openLogsModal')
  const blocks = await getAllBlocks()
  if( !flowID.value ) throw new Error("flowID is not defined")
  const code = await createRunnableCode(flow.value, flowID.value, blocks)

  if( !(await exists(`${projectPath.value}/pasta` )) ){
    await createDir(`${projectPath.value}/pasta`)
  }
  await writeTextFile(`${projectPath.value}/pasta/${flowID.value}.ts`, code) //TODO:`.pasta`にする
  await invoke("run_flow", {
    projectPath: projectPath.value,
    flowId: flowID.value
  })
}

defineExpose({ runFlow })
</script>