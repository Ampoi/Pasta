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
import { Block, BlockRect } from '../model/block';
import { ports } from "../utils/ports"
import { Flow } from '../model/flow';
import { Callback } from '../model/utils';

const props = defineProps<{
    flow: Flow
    flowID: string
}>()

const xGap = 240
const yGap = 40
const spaceHeight = 160

const emit = defineEmits<{
    (e: "getBlockRect", blockID: string, callback: Callback<BlockRect>): void
}>()

const getBlockRect = async (blockID: string) => {
    return new Promise<BlockRect>((resolve) => emit("getBlockRect", blockID, resolve))
}

const getBlockPositions = async () => {
    const layers = createLayers(props.flow)
    const blockPositions: Record<string, { x: number, y: number }> = {}
    const layerHeights: number[] = []

    let widthSum = 0
    for( const layer of layers ){
        let heightSum = 0
        let maxWidth = 0
        
        for( const blockID of layer ){
            if( blockID ){
                const blockRect = await getBlockRect(blockID)
                blockPositions[blockID] = { x: widthSum, y: heightSum }
    
                if( maxWidth < blockRect.width ) maxWidth = blockRect.width
                heightSum += blockRect.height + yGap
            }else{
                heightSum += spaceHeight + yGap
            }
        }
        
        widthSum += maxWidth + xGap
        layerHeights.push(heightSum)
    }

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

const getPortPositions = async (blockPositions: Record<string, {
    x: number
    y: number
}>) => {
    const portPositions: {
        [blockID: string]: {
            [type in "inputs" | "outputs"]?: {
                [portID: string]: {
                    x: number;
                    y: number;
                }
            }
        }
    } = {}

    const updateDefaultPortPosition = async (
        type: "inputs" | "outputs",
        blockID: string,
        blockPorts: (typeof ports)[number][string]["inputs"|"outputs"],
        { x, y }: Record<"x"|"y",number>
    ) => {
        const blockRect = await getBlockRect(blockID)
        const portAmount = blockPorts.length + 1
        
        if( !portPositions[blockID] ) portPositions[blockID] = {}
        if( !portPositions[blockID][type] ) portPositions[blockID][type] = {};

        (portPositions[blockID][type] as {[portID: string]: {x: number, y: number}}).default = {
            x: x + (type == "outputs" ? blockRect.width : 0),
            y: y + blockRect.height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + portHeight/2
        }
    }

    //TODO: ここらへんのリファクタリング
    const updatePortPosition = async (
        type: "inputs" | "outputs",
        blockID: string,
        blockPorts: (typeof ports)[number][string]["inputs"|"outputs"],
        portID: string,
        i: number,
        { x, y }: Record<"x"|"y",number>
    ) => {
        const portAmount = blockPorts.length + 1
        const blockRect = await getBlockRect(blockID)
        
        if( !portPositions[blockID] ) portPositions[blockID] = {}
        if( !portPositions[blockID][type] ) portPositions[blockID][type] = {};

        (portPositions[blockID][type] as {[portID: string]: {x: number, y: number}})[portID] = {
            x: x + (type == "outputs" ? blockRect.width : 0),
            y: y + blockRect.height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + ( portHeight + portYGap ) * (i+1) + portHeight/2
        }
    }

    const flowPorts = ports[props.flowID]
    if( flowPorts ){
        await Promise.all(Object.entries(flowPorts).map(async ([blockID, blockPorts]) => {
            if( !blockPositions[blockID] ) return
    
            await Promise.all([
                ...[
                    updateDefaultPortPosition("inputs", blockID, blockPorts.outputs, blockPositions[blockID]),
                    (blockPorts.inputs ? blockPorts.inputs.map(async (portID, i) => await updatePortPosition("inputs", blockID, blockPorts.inputs, portID, i, blockPositions[blockID])) : [])
                ],
                ...[
                    updateDefaultPortPosition("outputs", blockID, blockPorts.outputs, blockPositions[blockID]),
                    blockPorts.outputs.map(async (portID, i) => await updatePortPosition("outputs", blockID, blockPorts.outputs, portID, i, blockPositions[blockID]))
                ]
            ])
        }))
    }

    return portPositions
}

const getLines = (portPositions: {
    [blockID: string]: {
        [type in "inputs" | "outputs"]?: {
            [portID: string]: {
                x: number;
                y: number;
            }
        }
    };
}) => {
    const lines: Record<"from"|"to",Record<"x"|"y",number>>[] = [];
    const blockEntries = Object.entries(props.flow.blocks) as [string, Block][]
    
    blockEntries.forEach(([blockID, block]) => {
        Object.entries(block.connectedPorts).forEach(([portID, connectedTo]) => {
            const fromBlock = portPositions[blockID]
            if( !fromBlock ) return
            
            const from = fromBlock.outputs?.[portID]
            if( !from ) return

            Object.entries(connectedTo).forEach(([connectedBlockID, connectedPortID]) => {
                const toBlock = portPositions[connectedBlockID]
                if( !toBlock ) return

                const to = toBlock.inputs?.[connectedPortID]
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
    const portPositions = await getPortPositions(blockPositions)
    const newLines = getLines(portPositions)
    lines.value = newLines
}

onMounted(() => {
    watch(() => props.flow, updateLines, { immediate: true })
    watch(ports, updateLines, { deep: true })
})
</script>