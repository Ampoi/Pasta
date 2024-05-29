<template>
    <div
        class="bg-zinc-900 p-1.5 rounded-xl border-zinc-700 border-[1px] select-none"
        :class="{
            'border-blue-500 border-2': selected,
        }"
        @click="emit('click')"
        ref="port">
        <div
            v-if="defaultPort"
            class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
        <div
            v-else
            class="flex items-center gap-2"
            :class="reverse ? 'flex-row-reverse' : 'flex-row'">
            <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-500 grid place-content-center">
                {{ type ? type[0].toUpperCase(): "?" }}
            </div>
            <p class="overflow-hidden text-ellipsis text-sm text-white">{{ name }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
defineProps<{
    selected: boolean
} & ({
    reverse: boolean
    type: string
    name: string
    defaultPort?: false
} | {
    reverse?: undefined
    type?: undefined
    name?: undefined
    defaultPort: true
})>()

const emit = defineEmits<{
    (e: "click"): void
}>()
</script>