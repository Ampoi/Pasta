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
import { createLayers } from '../utils/createLayers';
import { Block } from '../model/block';
import { ports } from "../utils/ports"
import { Flow } from '../model/flow';

const props = defineProps<{
    flow: Flow
    flowID: string
}>()

const xGap = 240
const yGap = 40
const spaceHeight = 160

const emit = defineEmits<{
    (e: "getBlockRect", blockID: string, callback: (rect: Record<"height" | "width", number>) => void): void
}>()

const getBlockRect = async (blockID: string) => {
    return new Promise<Record<"height" | "width", number>>((resolve) => {
        emit("getBlockRect", blockID, resolve)
    })
}

const getBlockPositions = async () => {
    const layers = createLayers(props.flow)
    const blockPositions: Record<string, { x: number, y: number }> = {}
    const layerHeights: number[] = []

    let widthSum = 0
    console.log(layers)
    await Promise.all(layers.map(async (layer) => {
        let heightSum = 0
        let maxWidth = 0
        await Promise.all(layer.map(async (blockID) => {
            if( blockID ){
                const blockRect = await getBlockRect(blockID)
                console.log(blockRect, blockID)

                if( maxWidth < blockRect.width ) maxWidth = blockRect.width
                heightSum += blockRect.height + yGap
            }
            heightSum += spaceHeight + yGap
        }))

        layerHeights.push(heightSum)
        widthSum += maxWidth + xGap
    }))

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

    //TODO: ここらへんのリファクタリング
    const updatePortPosition = async (
        type: "args" | "returnValues",
        blockID: string,
        blockPorts: (typeof ports)[number][string]["args"|"returnValues"],
        portID: string,
        i: number,
        { x, y }: Record<"x"|"y",number>
    ) => {
        if( !portPositions[blockID] ) portPositions[blockID] = {}

        const portAmount = blockPorts.length + 1
        const blockRect = await getBlockRect(blockID)
        
        portPositions[blockID][portID] = {
            x: x + (type == "returnValues" ? blockRect.width : 0),
            y: y + blockRect.height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + ( portHeight + portYGap ) * (i+1) + portHeight/2
        }
    }

    const flowPorts = ports[props.flowID]
    if( flowPorts ){
        Object.entries(flowPorts).forEach(([blockID, blockPorts]) => {
            if( !blockPositions[blockID] ) return
    
            if( blockPorts.args ){
                blockPorts.args.forEach((portID, i) => updatePortPosition("args", blockID, blockPorts.args, portID, i, blockPositions[blockID]))
            }
            blockPorts.returnValues.forEach((portID, i) => updatePortPosition("returnValues", blockID, blockPorts.returnValues, portID, i, blockPositions[blockID]))
        })
    }

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
    const blockEntries = [["trigger", props.flow.trigger], ...Object.entries(props.flow.blocks)] as [string, Block][]
    
    blockEntries.forEach(([blockID, block]) => {
        Object.entries(block.connectedPorts).forEach(([portID, connectedTo]) => {
            const fromBlock = portPositions[blockID]
            if( !fromBlock ) return
            
            const from = fromBlock[portID]
            if( !from ) return

            Object.entries(connectedTo).forEach(([connectedBlockID, connectedPortID]) => {
                const toBlock = portPositions[connectedBlockID]
                if( !toBlock ) return

                const to = toBlock[connectedPortID]
                if( !to ) return

                lines.push({ from, to })
            })
        })
    })

    return lines
}

const lines = ref<Record<"from"|"to",Record<"x"|"y",number>>[]>([])
const updateLines = async () => {
    const blockPositions = await getBlockPositions()
    const portPositions = getPortPositions(blockPositions)
    lines.value = getLines(portPositions)
}

onMounted(() => {
    watch(() => props.flow, updateLines, { immediate: true })
    watch(ports, updateLines, { deep: true })
})
</script>