<template>
  <svg
    ref="linesArea"
    class="w-full h-full absolute top-0 left-0">
    <path
      v-for="line in lines"
      :d="`
        M ${line.from.x} ${line.from.y} C ${line.from.x + 100} ${line.from.y},
        ${line.to.x - 100} ${line.to.y}, ${line.to.x} ${line.to.y}`"
      stroke="#27272a"
      fill="none"
      stroke-width="2"/>
  </svg>
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";
import { Rect } from "../model/utils";
import { ports } from "../utils/ports";
import { Callback } from "../model/utils";
import { lines, updateLinesWithArgs } from "../hooks/lines";
import { flow, flowID } from "../hooks/flow";

const emit = defineEmits<{
  (e: "getNodeRect", blockID: string, callback: Callback<Rect>): void;
}>();

const getNodeRect = async (blockID: string) => {
  return new Promise<Rect>((resolve) => emit("getNodeRect", blockID, resolve));
};

const updateLines = () => updateLinesWithArgs(getNodeRect);

onMounted(() => {
  watch(() => flow.value, updateLines, { immediate: true, deep: true });
  watch(() => flowID.value, updateLines, { immediate: true });
  watch(ports, updateLines, { deep: true });
});
</script>