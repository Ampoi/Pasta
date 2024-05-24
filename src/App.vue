<template>
  <Editor
    v-if="project"
    :project/>
  <Launch
    v-else/>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { Project } from "./model/project"

import Editor from "./pages/editor.vue"
import Launch from "./pages/launch.vue"

const project = ref<Project | undefined>()
</script>