<template>
  <div class="w-screen h-screen flex flex-col bg-zinc-900">
    <header
      data-tauri-drag-region
      class="flex flex-row items-center py-1.5 pl-20 pr-8"
      @dblclick="maximizeWindow"
    >
      <input
        type="text"
        :value="project.title"
        class="bg-transparent py-1 px-2 rounded-md outline-none border-[1px] border-zinc-700 bg-black basis-60 font-bold text-white"
      />
      <div class="grow" />
      <button>
        <i class="bi bi-play text-zinc-400 text-2xl" />
      </button>
    </header>
    <DraggableArea class="grow border-t-[1px] bg-black border-zinc-700 relative p-4">
        <div class="relative">
            <div class="flex flex-row gap-60 items-center">
            <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
                <div v-for="blockID in row">
                <div v-if="!blockID" class="h-40" />
                <BlockComponent
                    v-else
                    :isTrigger="blockID == 'trigger'"
                    :blockID
                    :blockSettings="
                    blockID == 'trigger'
                        ? project.trigger
                        : project.blocks[blockID]
                    "
                />
                </div>
            </div>
            </div>
            <Lines class="-z-10" :project />
        </div>
    </DraggableArea>
  </div>
</template>
<script setup lang="ts">
import BlockComponent from "../components/block.vue";
import { computed, ref, watch } from "vue";
import { createLayers } from "../utils/createLayers";
import Lines from "../components/lines.vue";
import DraggableArea from "../components/draggableArea.vue";
import { appWindow } from "@tauri-apps/api/window";
import { Project } from "../model/project";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";

const maximizeWindow = (event: MouseEvent) => {
  event.preventDefault();
  appWindow.maximize();
};

const props = defineProps<{
    projectPath: string
}>()

watch(() => props.projectPath, () => {
  window.location.reload()
})

const projectFilePath = `${props.projectPath}/pasta.json`

const _project = ref<Project>(await (async () => {
  const newProject = await readTextFile(projectFilePath)
  return (JSON.parse(newProject) as Project) ?? Project.default
})())

const project = computed<Project>({
    get(){
      return _project.value
    },
    set(newValue){
      _project.value = newValue
      writeTextFile(projectFilePath, JSON.stringify(newValue))
    }
})

const renderedBlockIDs = computed(() => {
  return createLayers(project.value);
});
</script>