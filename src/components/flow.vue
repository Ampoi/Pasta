<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="blockID in row">
          <div v-if="!blockID" class="h-40" />
          <Suspense v-else>
            <BlockComponent
              :blockID
              :blockSettings="flow.nodes[blockID]"
              :flowID="id"
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
import BlockComponent from './block.vue';
import { Flow } from "../model/flow"
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { Block } from '../model/block';
import { Callback } from "../model/utils"
import { PortPlace, addPortConnection } from '../utils/connectPorts';
import { createRunnableCode } from '../utils/createRunnableCode';
import { projectPath } from '../utils/projectPath';
import { Rect } from "../model/utils"
import { invoke } from '@tauri-apps/api';

const props = defineProps<{
  id: string
}>()

const isFlow = (flow: unknown): flow is Flow => {
  if(!(
    (typeof flow == "object" && flow != null) &&
    ("nodes" in flow) &&
    !(flow.nodes instanceof Array)
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

const blocks = reactive<{ [blockID: string]: InstanceType<typeof BlockComponent> }>({})

const getBlockRect = (blockID: string, callback: Callback<Rect>) => {
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

const getAllBlocks = async (): Promise<Record<string, Block>> => {
  const blockNames = await getAllBlockNames()
  const blocks: Record<string, Block> = {}
  for (const blockName of blockNames) {
    const blockPath = `${blocksPath.value}/${blockName}/block.json`
    try {
      const fileText = await readTextFile(blockPath)
      const fileJSON = JSON.parse(fileText) as Block
      blocks[blockName] = fileJSON
    } catch (error) {
      console.warn(`an error occurred on blockName: ${blockName}:\n${error}`)
    }
  }
  return blocks
}

const modalOpenedTab = defineModel<string | undefined>("modalOpenedTab")

const runFlow = async () => {
  const blocks = await getAllBlocks()
  const code = createRunnableCode(flow.value, blocks)
  await writeTextFile(`${projectPath.value}/pasta/${props.id}.ts`, code) //TODO:`.pasta`にする
  invoke("run_flow", {
    projectPath: projectPath.value,
    flowId: props.id
  })
  modalOpenedTab.value = "logs"
}

defineExpose({ runFlow })
</script>