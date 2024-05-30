<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="blockID in row">
          <div v-if="!blockID" class="h-40" />
          <Suspense v-else>
            <Block
              :blockID
              :blockSettings="flow.blocks[blockID]"
              :flowID="id"
              :project-path="projectPath"
              @open-code-modal="emit('open-code-modal', blockID)"
              :ref="(el: any) => { blocks[el.id] = el }"
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
      @getBlockRect="getBlockRect"/>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { createLayers } from '../utils/createLayers';
import Lines from './lines.vue';
import Block from './block.vue';
import { Flow } from "../model/flow"
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { BlockRect, BlockExposedData } from '../model/block';
import { Callback } from "../model/utils"

const props = defineProps<{
  id: string
  projectPath: string
}>()

const emit = defineEmits<{
  (e: "open-code-modal", blockID: string): void
}>()

const isFlow = (flow: unknown): flow is Flow => {
  if(!(
    (typeof flow == "object" && flow != null) &&
    ("blocks" in flow) &&
    !(flow.blocks instanceof Array)
  )) return false

  return true
}

const flowPath = `${props.projectPath}/flows/${props.id}/main.json`
const flow = ref(Flow.create())
const updateFlow = async () => {
  try {
    const fileText = await readTextFile(flowPath)
    const fileJSON = JSON.parse(fileText)
    if( !isFlow(fileJSON) ) throw new Error(`Invalid Flow: ${flowPath}`)
    flow.value = fileJSON
  }catch(e){
    console.warn(`flowの更新中にエラーが発生しました:\n${e}`)
  }
}
updateFlow().then(() => {
  watch(flow, async () => {
    try{
      await writeTextFile(flowPath, JSON.stringify(flow.value))
    }catch(e){
      console.warn(`flowの保存中にエラーが発生しました:\n${e}`)
    }
  })
})

const blocks = reactive<{ [blockID: string]: BlockExposedData }>({})

const getBlockRect = (blockID: string, callback: Callback<BlockRect>) => {
  try {
    blocks[blockID].getBlockRect(callback)
  } catch (error) {
    console.warn(`an error occurred on blockID: ${blockID}:\n${error}`)
  }
}

const renderedBlockIDs = computed(() => {
  return createLayers(flow.value);
});

type PortPlace = {
  type: "arg" | "returnValue"
  blockID: string
  portID: string
}

const selectedPort = ref<PortPlace | null>(null)

const connectPorts = (from: PortPlace, to: PortPlace) => {
  if(
    from.blockID == to.blockID ||
    from.type == to.type
  ) return

  const oldFlow = flow.value
  const newFlow = {
      ...oldFlow,
      blocks: {
        ...oldFlow.blocks,
        [from.blockID]: {
          ...oldFlow.blocks[from.blockID],
          connectedPorts: {
            ...oldFlow.blocks[from.blockID].connectedPorts,
            [from.portID]: {
              ...oldFlow.blocks[from.blockID].connectedPorts[from.portID],
              [to.blockID]: to.portID
            }
          }
        }
      }
    }
  flow.value = newFlow
}
</script>