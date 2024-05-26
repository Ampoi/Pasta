<template>
  <div class="w-screen h-screen flex flex-col bg-zinc-900">
    <header
      data-tauri-drag-region
      class="flex flex-row items-center py-1.5 pl-20 pr-8 gap-4"
      @dblclick="maximizeWindow">
      <button
        @click="openLaunchView">
        <i class="bi bi-house-door text-zinc-500 text-xl"/>
      </button>
      <div class="relative">
        <input
          type="text"
          v-model="project.title"
          class="bg-transparent py-1 pl-2 pr-8 rounded-md outline-none border-[1px] border-zinc-700 bg-black basis-60 font-bold text-white"/>
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2"
          @click="openProjectFolder">
          <Icon icon="fluent:folder-16-regular" class="text-zinc-500 text-xl"/>
        </button>
      </div>
      <div class="grow" />
      <button>
        <Icon icon="fluent:play-16-regular" class="text-zinc-500 text-xl"/>
      </button>
    </header>
    <main class="grow border-t-[1px] bg-black border-zinc-700 relative">
      <DraggableArea class="w-full h-full p-4">
        <div class="flex flex-col gap-4">
          <Flow
            v-for="(flow, index) in project.flows"
            :flow
            :index
            :project-path="projectPath"
            @open-code-modal="(blockID) => openedCodeBlockID = blockID"/>
        </div>
      </DraggableArea>
      <CodeEditorModal
        v-if="!!openedCodeBlockID"
        v-model:blockID="openedCodeBlockID"/>
    </main>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";

import Flow from "../components/flow.vue"
import DraggableArea from "../components/draggableArea.vue";
import CodeEditorModal from "../components/codeEditorModal.vue";

import { appWindow } from "@tauri-apps/api/window";
import { Project } from "../model/project";
import { readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";

import { Icon } from "@iconify/vue";

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

const project = reactive<Project>(await (async () => {
  const newProject = await readTextFile(projectFilePath)
  return (JSON.parse(newProject) as Project) ?? Project.create()
})())

watch(project, (newValue) => {
  writeTextFile(projectFilePath, JSON.stringify(newValue))
})

const openLaunchView = () => {
  localStorage.removeItem("latestProjectPath") //TODO:最近開いたプロジェクトパスの保存・取得・破棄アルゴリズムをまとめる
  window.location.reload()
}

const openProjectFolder = () => {
  invoke("open_in_finder", { path: props.projectPath })
}

const openedCodeBlockID = ref<string | undefined>(undefined)
</script>