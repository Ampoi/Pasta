<template>
    <div
        class="flex flex-row items-center"
        :class="{
            'flex-row-reverse': portType != 'input'
        }">
        <div
            class="h-[2px] grow min-w-2 bg-zinc-800"
            :class="{
                'opacity-0': !isConnected,
            }"/>
        <div
            class="bg-zinc-900 p-1.5 rounded-xl select-none border-[1px] w-min"
            :class="{
                'border-zinc-700': !selected,
                '!border-blue-500': selected,
                'bg-red-900 border-red-500': !isConnected && portType == 'input' && name != 'default'
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
</template>
<script setup lang="ts">
import { computed } from "vue";
import { type PortPlace } from "../../utils/connectPorts";
import { lines } from "../../hooks/lines";

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
        (props.nodeID == selectedPort.value.blockID) &&
        (props.name == selectedPort.value.portID)
    )
})

const onClick = () => {
  selectedPort.value = {
    type: props.portType,
    blockID: props.nodeID,
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