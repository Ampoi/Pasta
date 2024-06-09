<template>
    <div class="relative">
        <div
            class="flex flex-row items-center"
            :class="{
                'flex-row-reverse': portType != 'input'
            }">
            <div
                class="h-[2px] grow min-w-2 bg-zinc-800"
                :class="{
                    'opacity-0': !isConnected && !selected,
                }"/>
            <div
                class="bg-zinc-900 p-1.5 rounded-xl select-none border-[1px] w-min"
                :class="{
                    '!bg-red-900 !border-red-500': !isConnected && portType == 'input' && name != 'default',
                    'border-zinc-700': !selected,
                    '!border-blue-500': selected
                }"
                @click="onClick"
                ref="port">
                <div
                    v-if="props.name == 'default'"
                    class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-slate-400 grid place-content-center"/>
                <div
                    v-else
                    class="flex items-center gap-2"
                    :class="portType == 'input' ? 'flex-row-reverse' : 'flex-row'">
                    <div class="size-5 text-sm font-mono rounded-md font-semibold text-white bg-blue-500 grid place-content-center">
                        {{ type ? type[0].toUpperCase(): "?" }}
                    </div>
                    <p class="overflow-hidden text-ellipsis text-sm text-white">{{ name }}</p>
                </div>
            </div>
        </div>
        <div
            v-if="selected"
            class="absolute top-1/2"
            :class="portType == 'input' ? 'left-0': 'right-0'">
            <svg
                class="w-6 h-10 absolute top-0"
                :class="portType == 'input' ? 'left-0 -translate-x-full -scale-x-100': 'right-0 translate-x-full'"
                ref="linesArea">
                <path
                    d="M 0 0 C 24 0,
                    0 40, 24 40"
                    stroke="#27272a" fill="none" stroke-width="2"/>
            </svg>
            <CreateNewBlockButton
                :portType
                :nodeID="nodeID"
                v-model:selectedPort="selectedPort"/>
        </div>
    </div>
</template>
<style scoped>
.not\:hover\:border-dashed:not(:hover) {
    border-style: dashed
}
</style>
<script setup lang="ts">
import { computed } from "vue";
import { PortPlace } from "../../hooks/flow";
import { lines } from "../../hooks/lines";
import CreateNewBlockButton from "./createNewBlockButton.vue";

const props = defineProps<{
    portType: "input" | "output"
    nodeID: string
} & ({
    name: "default"
    type?: undefined
} | {
    name: string
    type: string
})>()

const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })

const selected = computed<boolean>(() => {
    return (
        !!(selectedPort.value) &&
        (props.portType == selectedPort.value.type) &&
        (props.nodeID == selectedPort.value.nodeID) &&
        (props.name == selectedPort.value.portID)
    )
})

const onClick = () => {
  selectedPort.value = {
    type: props.portType,
    nodeID: props.nodeID,
    portID: props.name ?? "default"
  }
}

const isConnected = computed(() => {
    return lines.value.some((line) => {
        return (
            (line.from.blockID == props.nodeID && line.from.portID == props.name && props.portType == "output") ||
            (line.to.blockID == props.nodeID && line.to.portID == props.name && props.portType == "input")
        )
    })
})
</script>