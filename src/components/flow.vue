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
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { BlockRect, BlockExposedData, BlockData } from '../model/block';
import { Callback } from "../model/utils"
import { PortPlace, addPortConnection } from '../utils/connectPorts';
import { createRunnableCode } from '../utils/createRunnableCode';
import { projectPath } from '../utils/projectPath';

const props = defineProps<{
  id: string
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

const flowPath = computed(() => `${projectPath.value}/flows/${props.id}/main.json`)
const flow = ref(Flow.create())
const updateFlow = async () => {
  try {
    const fileText = await readTextFile(flowPath.value)
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
      await writeTextFile(flowPath.value, JSON.stringify(flow.value))
    }catch(e){
      console.warn(`flowの保存中にエラーが発生しました:\n${e}`)
    }
  })
})

watch(() => props.id, async () => {
  await updateFlow()
  console.log("wow")
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

const selectedPort = ref<PortPlace | null>(null)

const connectPorts = (from: PortPlace, to: PortPlace) => {
  const newFlow = addPortConnection(flow.value, from, to)
  if( newFlow ) {
    flow.value = newFlow
  }
}

const blocksPath = computed(() => `${projectPath.value}/blocks`)

const getAllBlockNames = async (): Promise<string[]> => {
  try {
    const entries = await readDir(blocksPath.value);
    const directories = entries
      .filter(entry => entry.children !== undefined)
      .map(entry => entry.name)
      .filter((name): name is string => !!name)
    return directories;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

const getAllBlocks = async (): Promise<Record<string, BlockData>> => {
  const blockNames = await getAllBlockNames()
  const blocks: Record<string, BlockData> = {}
  for (const blockName of blockNames) {
    const blockPath = `${blocksPath.value}/${blockName}/block.json`
    try {
      const fileText = await readTextFile(blockPath)
      const fileJSON = JSON.parse(fileText) as BlockData
      blocks[blockName] = fileJSON
    } catch (error) {
      console.warn(`an error occurred on blockName: ${blockName}:\n${error}`)
    }
  }
  return blocks
}

const runFlow = async () => {
  const blocks = await getAllBlocks()
  const code = createRunnableCode(flow.value, blocks)
  console.log(code)
}

defineExpose({ runFlow })
</script>