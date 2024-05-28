<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="blockID in row">
          <div v-if="!blockID" class="h-40" />
          <Suspense v-else>
            <Block
              :blockID
              :blockSettings="blockID == 'trigger' ? flow.trigger : flow.blocks[blockID]"
              :flowID="id"
              :project-path="projectPath"
              @open-code-modal="emit('open-code-modal', blockID)"
              ref="block"/>
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
import { computed, onMounted, ref } from 'vue';
import { createLayers } from '../utils/createLayers';
import Lines from './lines.vue';
import Block from './block.vue';
import { Flow } from "../model/flow"
import { readTextFile } from '@tauri-apps/api/fs';

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
    ("trigger" in flow && "blocks" in flow) &&
    !(flow.blocks instanceof Array)
  )) return false

  return true
}

const flow = ref(Flow.create())
const updateFlow = async () => {
  try {
    const flowPath = `${props.projectPath}/flows/${props.id}/flow.json`
    const fileText = await readTextFile(flowPath)
    const fileJSON = JSON.parse(fileText)
    if( !isFlow(fileJSON) ) throw new Error(`Invalid Flow: ${flowPath}`)
    flow.value = fileJSON
  }catch(e){
    console.warn(`flowの更新中にエラーが発生しました:\n${e}`)
  }
}
updateFlow()

const block = ref()
onMounted(() =>{
  console.log(block.value)
})

const getBlockRect = (blockID: string) => {
  return { height: 0, width: 0 }
}

const renderedBlockIDs = computed(() => {
  return createLayers(flow.value);
});
</script>