<template>
  <div class="relative">
    <div class="flex flex-row gap-60 items-center">
      <div v-for="row in renderedBlockIDs" class="flex flex-col gap-10">
        <div v-for="blockID in row">
          <div v-if="!blockID" class="h-40" />
          <Block
            v-else
            :isTrigger="blockID == 'trigger'"
            :blockID
            :blockSettings="
              blockID == 'trigger' ? flow.trigger : flow.blocks[blockID]
            "
            @open-code-modal="emit('open-code-modal', blockID)"
          />
        </div>
      </div>
    </div>
    <Lines class="-z-10" :flow />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { Project } from '../model/project';
import { createLayers } from '../utils/createLayers';
import Lines from './lines.vue';
import Block from './block.vue';

const props = defineProps<{
    flow: Project["flows"][number]
}>()

const emit = defineEmits<{
  (e: "open-code-modal", blockID: string): void
}>()

const renderedBlockIDs = computed(() => {
  return createLayers(props.flow);
});
</script>