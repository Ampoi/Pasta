<template>
    <div
        class="flex flex-row items-center"
        :class="{
            'flex-row-reverse': portType != 'input'
        }">
        <div
            class="h-[2px] grow min-w-2 bg-zinc-800"/>
        <div
            class="bg-zinc-900 p-1.5 rounded-xl select-none border-[1px] w-min"
            :class="{
                'border-blue-500': selected,
                'border-zinc-700': !selected
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
</script>