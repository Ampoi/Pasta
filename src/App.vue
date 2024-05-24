<template>
  <Suspense v-if="projectPath">
    <Editor
      :projectPath/>
  </Suspense>
  <Launch
    v-else
    @opened-project="updateProjectPath"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import Editor from "./pages/editor.vue"
import Launch from "./pages/launch.vue"

const projectPath = ref<string | undefined>()
function updateProjectPath(path: string){
  projectPath.value = path
  console.log(projectPath.value)
}
</script>