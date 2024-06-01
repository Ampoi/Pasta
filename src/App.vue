<template>
  <Suspense v-if="projectID">
    <Editor
      :projectID/>
  </Suspense>
  <Launch
    v-else
    @open-project="openProject"/>
</template>
<script setup lang="ts">
import Editor from "./pages/editor.vue"
import Launch from "./pages/launch.vue"
import { dialog } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { appDataDir } from '@tauri-apps/api/path';
import { projectID } from "./utils/projectID"

const openProject = async () => {
  const selectedFolder = await dialog.open({
      directory: true,
      multiple: false,
      title: "プロジェクトを開く"
  })

  if( selectedFolder && typeof selectedFolder == "string" ){
    projectID.value = selectedFolder
  }
}

appDataDir().then(path => console.log(path))

appWindow.listen("open", openProject)
</script>