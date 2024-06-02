import { ref } from "vue"
import { createLayers } from '../utils/createLayers';
import { Flow } from "../model/flow";
import { Rect } from "../model/utils";
import { ports } from "../utils/ports"

const xGap = 240
const yGap = 40
const spaceHeight = 160
const portHeight = 34
const portYGap = 8

const getBlockPositions = async (flow: Flow, getBlockRect: (blockID: string) => Promise<Rect>) => {
    const layers = createLayers(flow)
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

const getPortPositions = async (
    blockPositions: Record<string, Record<"x"|"y", number>>,
    getBlockRect: (blockID: string) => Promise<Rect>,
    flowID: string
) => {
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

    const flowPorts = ports[flowID]
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

const getLines = (
    portPositions: {
        [blockID: string]: {
            [type in "inputs" | "outputs"]?: {
                [portID: string]: {
                    x: number;
                    y: number;
                }
            }
        }
    },
    flow: Flow
) => {
    const lines: Record<"from"|"to",Record<"x"|"y",number>>[] = [];
    const blockEntries = Object.entries(flow.nodes)
    
    blockEntries.forEach(([blockID, block]) => {
        if( !block.inputs ) return

        Object.entries(block.inputs).forEach(([portID, input]) => {
            try {
                const { fromBlockID, fromPortID } = input.type == "port" ? {
                    fromBlockID: input.value.blockID,
                    fromPortID: input.value.portID
                } : {
                    fromBlockID: input.defaultPortBlockID,
                    fromPortID: "default"
                }
    
                const fromBlockPortPositions = portPositions[fromBlockID]
                if( !fromBlockPortPositions ) return
    
                const from = fromBlockPortPositions.outputs?.[fromPortID]
                if( !from ) return

                const toBlockPortPositions = portPositions[blockID]
                if( !toBlockPortPositions ) throw new Error(`portPositions doesn't have property: ${blockID}`)
                
                const to = toBlockPortPositions.inputs?.[portID]
                if( !to ) throw new Error(`${portID} is not in outputs of ${blockID}`)
    
                lines.push({ from, to })
            }catch ( error ){
                console.warn(error)
            }
        })
    })

    return lines
}

export const useLines = () => {
    const lines = ref<Record<"from"|"to",Record<"x"|"y",number>>[]>([])
    
    const updateLinesWithArgs = async (flow: Flow, getBlockRect: (blockID: string) => Promise<Rect>, flowID: string) => {
        const blockPositions = await getBlockPositions(flow, getBlockRect)
        const portPositions = await getPortPositions(blockPositions, getBlockRect, flowID)
        const newLines = getLines(portPositions, flow)
        lines.value = newLines
    }

    return { lines, updateLinesWithArgs }
}