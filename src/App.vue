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
import { basename } from '@tauri-apps/api/path';
import { projectID } from "./utils/projectID"
import { accessibleDataDir, projectsDir } from "./constants/settings";
import { createDir, exists } from "@tauri-apps/api/fs";

const openProject = async () => {
  const selectFolderDialog: dialog.OpenDialogOptions = {
    directory: true,
    multiple: false,
    title: "プロジェクトを開く",
    defaultPath: projectsDir,
  }

  if( !await exists(projectsDir) ){
    if( !(await exists(accessibleDataDir)) ){
      await createDir(accessibleDataDir)
    }
    await createDir(projectsDir)
  }

  const selectedFolderPath = await dialog.open(selectFolderDialog)
  if( !selectedFolderPath || typeof selectedFolderPath != "string" ) return

  const selectedProjectID = await basename(selectedFolderPath)
  projectID.value = selectedProjectID
}

appWindow.listen("open", openProject)
</script>