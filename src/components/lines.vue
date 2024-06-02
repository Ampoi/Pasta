<template>
    <svg
        class="w-full h-full absolute top-0 left-0"
        ref="linesArea">
        <path
            v-for="line in lines"
            :d="`
            M ${line.from.x} ${line.from.y} C ${line.from.x + 100} ${line.from.y},
            ${line.to.x - 100} ${line.to.y}, ${line.to.x} ${line.to.y}`"
            stroke="#27272a" fill="none" stroke-width="2"/>
    </svg>
</template>
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { Rect } from '../model/utils';
import { ports } from "../utils/ports"
import { Flow } from '../model/flow';
import { Callback } from '../model/utils';
import { useLines } from "../hooks/useLines"

const props = defineProps<{
    flow: Flow
    flowID: string
}>()

const emit = defineEmits<{
    (e: "getBlockRect", blockID: string, callback: Callback<Rect>): void
}>()

const getBlockRect = async (blockID: string) => {
    return new Promise<Rect>((resolve) => emit("getBlockRect", blockID, resolve))
}

const { lines, updateLinesWithArgs } = useLines()
const updateLines = computed(() => {
    return () => updateLinesWithArgs(props.flow, getBlockRect, props.flowID)
})

onMounted(() => {
    watch(() => props.flow, updateLines.value, { immediate: true })
    watch(ports, updateLines.value, { deep: true })
})
</script>