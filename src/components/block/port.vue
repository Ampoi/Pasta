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
import { onMounted, ref } from 'vue';
import { portPositions, portPositionUpdaters } from "../../utils/portPositions"

const props = defineProps<{
    blockID: string
    type?: string
    name: string
    reverse?: boolean
}>()

const port = ref<HTMLElement>()

const updatePosition = () => {
    if(!port.value) throw new Error("ポートの要素がないです！")
    const { top, left, width, height } = port.value.getBoundingClientRect()
    const x = left + ( props.reverse ? 0 : width )
    const y = top + height / 2

    if( portPositions[props.blockID] ){
        if( portPositions[props.blockID][props.name] ){
            portPositions[props.blockID][props.name].y = y
            portPositions[props.blockID][props.name].x = x
        }else{
            portPositions[props.blockID][props.name] = { x, y }
        }
    }else{
        portPositions[props.blockID] = {
            [props.name]: { x, y }
        }
    }
}

onMounted(() => {
    portPositionUpdaters.push(updatePosition)
    updatePosition()
})
</script>