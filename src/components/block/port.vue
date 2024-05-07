<template>
    <div
        class="bg-white p-1.5 rounded-xl border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex items-center gap-2 select-none"
        :class="reverse ? 'flex-row-reverse' : 'flex-row'"
        ref="port">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-400 grid place-content-center">
            {{ type ? type[0].toUpperCase(): "?" }}
        </div>
        <p class="overflow-hidden text-ellipsis text-sm">{{ name }}</p>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    blockID: string
    type?: string
    name: string
    reverse?: boolean
}>()
</script>