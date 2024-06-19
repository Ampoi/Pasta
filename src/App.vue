<template>
  <Suspense v-if="projectID">
    <Editor
      :project-i-d/>
  </Suspense>
  <Launch
    v-else
    @openProject="openProject"/>
</template>
<script setup lang="ts">
import Editor from "./pages/editor.vue"
import Launch from "./pages/launch.vue"
import { dialog } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import { appDataDir, basename } from '@tauri-apps/api/path';
import { projectID } from "./utils/projectID"

const openProject = async () => {
  const projects = `${await appDataDir()}/projects`

  const selectedFolderPath = await dialog.open({
      directory: true,
      multiple: false,
      title: "プロジェクトを開く",
      defaultPath: projects,
  })
  if( !selectedFolderPath || typeof selectedFolderPath != "string" ) return

  const selectedProjectID = await basename(selectedFolderPath)
  projectID.value = selectedProjectID
}

appDataDir().then(path => console.log(path))

appWindow.listen("open", openProject)
</script>