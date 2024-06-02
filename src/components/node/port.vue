<template>
    <div
        class="flex flex-row items-center"
        :class="{
            'flex-row-reverse': !reverse
        }">
        <div
            class="h-[2px] grow min-w-2 bg-zinc-800"/>
        <div
            class="bg-zinc-900 p-1.5 rounded-xl select-none border-[1px] w-min"
            :class="{
                'border-blue-500': selected,
                'border-zinc-700': !selected
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
    </div>
</template>
<script setup lang="ts">
defineProps<{
    selected: boolean
    reverse: boolean
} & ({
    type: string
    name: string
    defaultPort?: false
} | {
    type?: undefined
    name?: undefined
    defaultPort: true
})>()

const emit = defineEmits<{
    (e: "click"): void
}>()
</script>