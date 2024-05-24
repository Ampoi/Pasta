<template>
    <svg
        class="w-full h-full absolute top-0 left-0"
        ref="linesArea">
        <path
            v-for="line in lines"
            :d="`
            M ${line.from.x} ${line.from.y} C ${line.from.x + 100} ${line.from.y},
            ${line.to.x - 100} ${line.to.y}, ${line.to.x} ${line.to.y}`"
            stroke="#27272a" fill="none" stroke-width="2"/>
    </svg>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Project } from '../model/project';
import { blockRects } from '../utils/blockRects';
import { createLayers } from '../utils/createLayers';
import { Block } from '../model/block';

const props = defineProps<{
    flow: Project["flows"][number]
}>()

const xGap = 240
const yGap = 40
const spaceHeight = 160

const getBlockPositions = () => {
    const layers = createLayers(props.flow)
    const blockPositions: Record<string, { x: number, y: number }> = {}
    const layerHeights: number[] = []

    let widthSum = 0
    layers.forEach((layer) => {
        let heightSum = 0
        layer.forEach((blockID) => {
            if( blockID ){
                blockPositions[blockID] = {
                    x: widthSum,
                    y: heightSum
                }
            }
            heightSum += ( blockID ? blockRects[blockID].height : spaceHeight ) + yGap
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

const portHeight = 34
const portYGap = 8

const getPortPositions = (blockPositions: Record<string, {
    x: number
    y: number
}>) => {
    const portPositions: {
        [blockID: string]: {
            [portID: string]: {
                x: number;
                y: number;
            }
        }
    } = {}

    const getPortPosition = (type: "args" | "returnValues", blockID: string, block: Block, portID: string, i: number, { x, y }: Record<"x"|"y",number>) => {
        if( !portPositions[blockID] ) portPositions[blockID] = {}
        
        const ports = block.ports[type]
        if( !ports ) return

        const portAmount = ports.length + 1
        portPositions[blockID][portID] = {
            x: x + (type == "returnValues" ? blockRects[blockID].width : 0),
            y: y + blockRects[blockID].height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + ( portHeight + portYGap ) * (i+1) + portHeight/2
        }
    }

    Object.entries(blockPositions).forEach(([blockID, blockPosition]) => {
        const block: Block = blockID == "trigger" ? props.flow.trigger : props.flow.blocks[blockID]

        if( block.ports.args ) block.ports.args.forEach((portID, i) => getPortPosition("args", blockID, block, portID, i, blockPosition))

        block.ports.returnValues.forEach((portID, i) => getPortPosition("returnValues", blockID, block, portID, i, blockPosition))
    })

    return portPositions
}

const getLines = (portPositions: {
    [blockID: string]: {
        [portID: string]: {
            x: number;
            y: number;
        };
    };
}) => {
    const lines: Record<"from"|"to",Record<"x"|"y",number>>[] = [];
    
    ([["trigger", props.flow.trigger], ...Object.entries(props.flow.blocks)] as [string, Block][]).forEach(([blockID, block]) => {
        Object.entries(block.connectedPorts).forEach(([portID, connectedTo]) => {
            const from = portPositions[blockID][portID]
            Object.entries(connectedTo).forEach(([connectedBlockID, connectedPortID]) => {
                const to = portPositions[connectedBlockID][connectedPortID]
                lines.push({ from, to })
            })
        })
    })

    return lines
}

const lines = ref<Record<"from"|"to",Record<"x"|"y",number>>[]>([])

onMounted(() => {
    watch(() => props.flow, () => {
        const blockPositions = getBlockPositions()
        const portPositions = getPortPositions(blockPositions)
        lines.value = getLines(portPositions)
    }, { immediate: true })
})
</script>