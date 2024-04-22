<template>
    <div
        class="bg-white p-1.5 rounded-xl border-gray-200 border-[1px] shadow-xl shadow-gray-300/40 flex flex-row items-center gap-2 select-none">
        <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-400 grid place-content-center">
            {{ type }}
        </div>
        <p class="overflow-hidden text-ellipsis text-sm">{{ name }}</p>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{
    type: string
    name: string
}>()

if( props.type.length != 1 ) console.warn("typeは1文字である必要があります！")
</script>