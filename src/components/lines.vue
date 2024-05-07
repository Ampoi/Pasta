<template>
    <svg
        class="w-full h-full absolute top-0 left-0"
        ref="linesArea">
        <rect
            v-for="block in blocks"
            :x="block.x" :y="block.y" width="100" height="100" fill="black" />
        <path
            v-for="line in lines"
            :d="`
            M ${line.from.x} ${line.from.y} C ${line.from.x + 100} ${line.from.y},
            ${line.to.x - 100} ${line.to.y}, ${line.to.x} ${line.to.y}`"
            stroke="#D8DCE2" fill="none" stroke-width="2"/>
    </svg>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Project } from '../model/project';
import { blockRects } from '../utils/blockRects';
import { createLayers } from '../utils/createLayers';

const props = defineProps<{
    project: Project
}>()

const xGap = 240
const yGap = 40
const spaceHeight = 160

const getBlockPositions = () => {
    const layers = createLayers(props.project)
    const blockPositions: Record<string, { x: number, y: number }> = {}
    const layerHeights: number[] = []

    let widthSum = 0
    layers.forEach((layer) => {
        let heightSum = 0
        layer.forEach((blockID, i) => {
            if( blockID ){
                blockPositions[blockID] = {
                    x: widthSum,
                    y: heightSum
                }
            }
            heightSum += (blockID ? blockRects[blockID].height : spaceHeight ) + yGap
        })

        layerHeights.push(heightSum)

        widthSum += layer.reduce((max, blockID) => {
            if( !blockID ) return max
            return max < blockRects[blockID].width ? blockRects[blockID].width : max
        }, 0) + xGap
    })

    const maxLayerHeight = layerHeights.reduce((max, height) => {
        return max < height ? height : max
    }, 0)

    layers.forEach((layer, i) => {
        const topBounding = (maxLayerHeight - layerHeights[i]) / 2
        layer.forEach((blockID) => {
            if( blockID ){
                blockPositions[blockID].y += topBounding
            }
        })
    })

    return blockPositions
}

const lines = computed<Record<"from"|"to",Record<"x"|"y",number>>[]>(() => {
    return []
})

const blocks = ref<Record<"x"|"y",number>[]>([])

onMounted(() => {
    blocks.value = Object.values(getBlockPositions())
})
</script>