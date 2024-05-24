<template>
  <Suspense v-if="projectPath">
    <Editor
      :projectPath/>
  </Suspense>
  <Launch
    v-else
    @open-project="openProject"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import Editor from "./pages/editor.vue"
import Launch from "./pages/launch.vue"
import { dialog } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';

const projectPath = ref<string | null>(localStorage.getItem("latestProjectPath"))

const openProject = async () => {
  const selectedFolder = await dialog.open({
      directory: true,
      multiple: false,
      title: "プロジェクトを開く"
  })

  if( selectedFolder && typeof selectedFolder == "string" ){
    projectPath.value = selectedFolder
    localStorage.setItem("latestProjectPath", selectedFolder)
  }
}

appWindow.listen("open", openProject)
</script>