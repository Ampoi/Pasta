import { ref } from "vue"
import { createLayers } from '../utils/createLayers';
import { Rect } from "../model/utils";
import { ports } from "../utils/ports"
import { flow, flowID } from "./flow";

const xGap = 240
const yGap = 40
const spaceHeight = 160
const portHeight = 34
const portYGap = 8

const getBlockPositions = async (getBlockRect: (blockID: string) => Promise<Rect>) => {
    const layers = createLayers(flow.value)
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
    getBlockRect: (blockID: string) => Promise<Rect>
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
            y: y + blockRect.height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + (portHeight + portYGap) * i + portHeight/2
        }
    }

    if( !flowID.value ) throw new Error("flowID is not defined")
    const flowPorts = ports[flowID.value]
    if( flowPorts ){
        await Promise.all(Object.entries(flowPorts).map(async ([blockID, blockPorts]) => {
            if( !blockPositions[blockID] ) return
    
            await Promise.all([
                ...["default", ...blockPorts.inputs].map(async (portID, i) => await updatePortPosition("inputs", blockID, blockPorts.inputs, portID, i, blockPositions[blockID])),
                ...["default", ...blockPorts.outputs].map(async (portID, i) => await updatePortPosition("outputs", blockID, blockPorts.outputs, portID, i, blockPositions[blockID]))
            ])
        }))
    }

    return portPositions
}

type Line = Record<"from"|"to",
    Record<"x"|"y",number> & {
        blockID: string
        portID: string
    }
>

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
    }
) => {
    const lines: Line[] = []
    const blockEntries = Object.entries(flow.value.nodes)

    for( const [toBlockID, block] of blockEntries ){
        let isBlockDefaultPortsConnected = false

        const toBlockPortPositions = portPositions[toBlockID]
        if( !toBlockPortPositions ) continue
        
        if( !block.inputs ){
            if( block.defaultPortNodeID ){
                const fromBlockID = block.defaultPortNodeID
                const fromBlockPortPositions = portPositions[fromBlockID]
                if( !fromBlockPortPositions ) continue
                const fromPosition = fromBlockPortPositions.outputs?.default
                if( !fromPosition ) continue

                const toPosition = toBlockPortPositions.inputs?.default
                if( !toPosition ) continue

                lines.push({
                    from: { ...fromPosition, blockID: fromBlockID, portID: "default" },
                    to: { ...toPosition, blockID: toBlockID, portID: "default" }
                })
            }
            continue
        }
        
        for( const [portID, input] of Object.entries(block.inputs) ){
            if( input.type == "setting" && isBlockDefaultPortsConnected ) continue
            if( input.value == undefined ) continue

            try {
                const { fromBlockID, fromPortID } = input.type == "port" ? {
                    fromBlockID: input.value.nodeID,
                    fromPortID: input.value.portID
                } : {
                    fromBlockID: block.defaultPortNodeID as string,
                    fromPortID: "default"
                }

                const fromBlockPortPositions = portPositions[fromBlockID]
                if( !fromBlockPortPositions ) continue
    
                const fromPosition = fromBlockPortPositions.outputs?.[fromPortID]
                if( !fromPosition ) continue

                const toPortID = input.type == "setting" ? "default" : portID
                const toPosition = toBlockPortPositions.inputs?.[toPortID]
                if( !toPosition ) throw new Error(`${portID} is not in outputs of ${toBlockID}`)

                if( input.type == "setting" ) isBlockDefaultPortsConnected = true
    
                lines.push({
                    from: { ...fromPosition, blockID: fromBlockID, portID: fromPortID },
                    to: { ...toPosition, blockID: toBlockID, portID: toPortID }
                })
            }catch ( error ){
                console.warn(error)
            }
        }
    }

    return lines
}

export const lines = ref<Line[]>([])

export const updateLinesWithArgs = async (getBlockRect: (blockID: string) => Promise<Rect>) => {
    if( !flowID.value ) return

    const blockPositions = await getBlockPositions(getBlockRect)
    const portPositions = await getPortPositions(blockPositions, getBlockRect)
    const newLines = getLines(portPositions)
    lines.value = newLines
}