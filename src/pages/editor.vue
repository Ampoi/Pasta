<template>
  <div class="w-screen h-screen flex flex-col bg-zinc-900">
    <header
      data-tauri-drag-region
      class="flex flex-row items-center py-1.5 pl-20 pr-8 gap-8"
      @dblclick="maximizeWindow">
      <button
        @click="openLaunchView">
        <Icon icon="fluent:home-16-regular" class="text-zinc-500 text-xl"/>
      </button>
      <div class="relative -ml-4">
        <input
          type="text"
          v-model="project.title"
          class="bg-transparent py-1 pl-2 pr-8 rounded-md outline-none border-[1px] border-zinc-700 basis-60 font-bold text-white"/>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2"
          @click="openProjectFolder">
          <Icon icon="fluent:folder-16-regular" class="text-zinc-500 text-xl"/>
        </button>
      </div>
      <FlowSelector
        v-if="flowIDs.length > 0"
        :flowIDs="flowIDs"
        v-model:flowID="flowID"
        class="-ml-5"/>
      <div class="grow" />
      <button
        @click="installDependencies">
        <Icon icon="fluent:play-16-regular" class="text-zinc-500 text-xl"/>
      </button>
      <button
        @click="runCode">
        <Icon icon="fluent:play-16-regular" class="text-zinc-500 text-xl"/>
      </button>
    </header>
    <main class="grow border-t-[1px] bg-black border-zinc-700 relative">
      <DraggableArea
        class="w-full h-full p-4"
        v-if="flowID">
        <Flow
          v-model:modal-opened-tab="modalOpenedTab"
          ref="flowComponent"/>
      </DraggableArea>
      <div
        v-else
        class="grid place-content-center w-full h-full">
        <div class="flex flex-col gap-4 items-center text-zinc-500">
          <h2 class="text-5xl font-semibold">フローを作成</h2>
          <input
            type="text"
            class="px-2 py-1 bg-transparent border-[1px] border-zinc-700 rounded-lg text-center placeholder:text-zinc-700"
            placeholder="フロー名">
          <button class="text-black bg-zinc-800 py-2 px-4 rounded-lg font-semibold">
            作成する
          </button>
        </div>
      </div>
      <Modal
        v-if="modalOpenedTab"
        v-model:opened-tab="modalOpenedTab"/>
    </main>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";

import Flow from "../components/flow.vue"
import DraggableArea from "../components/draggableArea.vue";
import FlowSelector from "../components/editor/flowSelector.vue";
import Modal from "../components/modal.vue";

import { appWindow } from "@tauri-apps/api/window";
import { Project } from "../model/project";
import { readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";

import { Icon } from "@iconify/vue";
import { projectID } from "../utils/projectID";
import { projectPath } from "../utils/projectPath"
import { flowID } from "../hooks/flow";

const maximizeWindow = (event: MouseEvent) => {
  event.preventDefault();
  appWindow.maximize();
};

watch(projectPath, () => {
  window.location.reload()
})

const projectFilePath = `${projectPath.value}/pasta.json`

const project = reactive<Project>(await (async () => {
  const newProject = await readTextFile(projectFilePath)
  return (JSON.parse(newProject) as Project) ?? Project.create()
})())

watch(project, (newValue) => {
  writeTextFile(projectFilePath, JSON.stringify(newValue))
})

const flowIDs = reactive<string[]>(await (async () => {
  const fileEntries = await readDir(`${projectPath.value}/flows`).catch((e) => {
    console.log(e)
    return []
  })

  const directoryNames = fileEntries
    .filter(entry => entry.children)
    .map(entry => entry.name)
    .filter((name): name is string => !!name)
  
  return directoryNames
})())

flowID.value = flowIDs[0]

const openLaunchView = () => {
  projectID.value = null
  window.location.reload()
}

const openProjectFolder = () => {
  invoke("open_in_finder", { path: projectPath.value })
}

const modalTabs = ["code", "logs"] as const
const modalOpenedTab = ref<typeof modalTabs[number]>()

const installDependencies = () => {
  invoke("install_typescript", { path: projectPath.value })
}

const flowComponent = ref<InstanceType<typeof Flow> | null>()
const runCode = () => {
  if( !flowComponent.value ) throw new Error("flowComponent is not defined")
  flowComponent.value.runFlow()
}
</script>