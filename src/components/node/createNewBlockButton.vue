<template>
  <button
    class="
      absolute -bottom-10 translate-y-1/2  h-12 w-32 rounded-xl flex flex-row justify-center items-center transition-all duration-200
      border-[1px] border-zinc-500 text-zinc-500 not:hover:border-dashed
      hover:text-white/80 hover:bg-blue-500/40 hover:border-blue-500"
    :class="isLeftSide ? '-left-6 -translate-x-full': '-right-6 translate-x-full'"
    @click="showPopOver = true">
    <NewBlockListPopOver
      v-if="showPopOver"
      class="absolute -top-4 -left-4"
      @selectBlock="createNodeFromThisPort"/>
    <Icon
      icon="fluent:add-circle-16-regular"
      class="text-xl"/>
    <p>新規ブロック</p>
  </button>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue/dist/iconify.js'
import NewBlockListPopOver from './newBlockListPopOver.vue';
import { createNode, PortPlace } from '../../hooks/flow';

const props = defineProps<{
  nodeID: string
  portType: 'input' | 'output'
}>()

const isLeftSide = computed(() => props.portType == 'input')
const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })

const showPopOver = ref(false)

const createNodeFromThisPort = (blockID: string) => {
  selectedPort.value = null
  createNode(blockID, props.nodeID, props.portType)
}
</script>