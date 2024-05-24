<template>
    <div
        class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] flex items-center gap-2 select-none"
        :class="reverse ? 'flex-row-reverse' : 'flex-row'"
        ref="port">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-500 grid place-content-center">
            {{ type ? type[0].toUpperCase(): "?" }}
        </div>
        <p class="overflow-hidden text-ellipsis text-sm text-white">{{ name }}</p>
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