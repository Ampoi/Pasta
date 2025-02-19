<template>
  <div class="w-screen h-screen flex flex-row bg-zinc-900">
    <Suspense>
      <SideBar/>
    </Suspense>
    <div class="flex flex-col grow">
      <header
        data-tauri-drag-region
        class="flex flex-row items-center py-1.5 px-4 gap-8"
        @dblclick="maximizeWindow">
        <button
          @click="openLaunchView">
          <Icon
            icon="fluent:home-16-regular"
            class="text-zinc-500 text-xl"/>
        </button>
        <div class="relative -ml-4">
          <input
            v-model="project.title"
            type="text"
            class="bg-transparent py-1 pl-2 pr-8 rounded-md outline-none border-[1px] border-zinc-700 basis-60 font-bold text-white">
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2"
            @click="openProjectFolder">
            <Icon
              icon="fluent:folder-16-regular"
              class="text-zinc-500 text-xl"/>
          </button>
        </div>
        <div class="grow"/>
        <button
          @click="installDependencies">
          <Icon
            icon="fluent:play-16-regular"
            class="text-zinc-500 text-xl"/>
        </button>
        <button
          @click="runCode">
          <Icon
            icon="fluent:play-16-regular"
            class="text-zinc-500 text-xl"/>
        </button>
      </header>
      <main class="grow border-t-[1px] bg-black border-zinc-700 relative">
        <div
          v-if="flowID"
          class="w-full h-full flex flex-row">
          <DraggableArea class="grow">
            <Flow
              ref="flowComponent"
              @openCodeModal="modalOpenedTab = 'Code'"
              @openLogsModal="modalOpenedTab = 'Logs'"/>
          </DraggableArea>
          <Modal
            v-model:opened-tab="modalOpenedTab"/>
        </div>
        <CreateFlowView
          v-else
          class="w-full h-full"/>
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";

import Flow from "../components/flow.vue"
import DraggableArea from "../components/draggableArea.vue";
import Modal from "../components/modal.vue";
import CreateFlowView from "../components/createFlowView.vue";
import SideBar from "../components/sideBar.vue";

import { appWindow } from "@tauri-apps/api/window";
import { Project } from "../model/project";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
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
  try{
    const newProject = await readTextFile(projectFilePath)
    if( !newProject ) throw new Error("Project file is empty")
    
    return (JSON.parse(newProject) as Project)
  }catch(e){
    const newProject = Project.create()
    await writeTextFile(projectFilePath, JSON.stringify(newProject))

    return newProject
  }
})())

watch(project, (newValue) => {
  writeTextFile(projectFilePath, JSON.stringify(newValue))
})

const openLaunchView = () => {
  projectID.value = null
  window.location.reload()
}

const openProjectFolder = () => {
  invoke("open_in_finder", { path: projectPath.value })
}

const modalOpenedTab = ref<"Logs" | "Code" | undefined>()

const installDependencies = () => {
  invoke("install_typescript", { path: projectPath.value })
}

const flowComponent = ref<InstanceType<typeof Flow> | null>()
const runCode = () => {
  if( !flowComponent.value ) throw new Error("flowComponent is not defined")
  flowComponent.value.runFlow()
}
</script>