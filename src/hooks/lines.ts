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

const getNodePositions = async (getNodeElementRect: (nodeID: string) => Promise<Rect>) => {
    const layers = createLayers(flow.value)
    const nodePositions: Record<string, { x: number, y: number }> = {}
    const layerHeights: number[] = []

    let widthSum = 0
    for( const layer of layers ){
        let heightSum = 0
        let maxWidth = 0
        
        for( const nodeID of layer ){
            if( nodeID ){
                const nodeRect = await getNodeElementRect(nodeID)
                nodePositions[nodeID] = { x: widthSum, y: heightSum }
    
                if( maxWidth < nodeRect.width ) maxWidth = nodeRect.width
                heightSum += nodeRect.height + yGap
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
        for( const nodeID of layer ){
            if( nodeID ){
                nodePositions[nodeID].y += topBounding
            }
        }
    })

    return nodePositions
}

const getPortPositions = async (
    nodePositions: Record<string, Record<"x"|"y", number>>,
    getNodeElementRect: (nodeID: string) => Promise<Rect>
) => {
    const portPositions: {
        [nodeID: string]: {
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
        nodeID: string,
        blockPorts: (typeof ports)[number][string]["inputs"|"outputs"],
        portID: string,
        i: number,
        { x, y }: Record<"x"|"y",number>
    ) => {
        const portAmount = blockPorts.length + 1
        const nodeRect = await getNodeElementRect(nodeID)
        
        if( !portPositions[nodeID] ) portPositions[nodeID] = {}
        if( !portPositions[nodeID][type] ) portPositions[nodeID][type] = {};

        (portPositions[nodeID][type] as {[portID: string]: {x: number, y: number}})[portID] = {
            x: x + (type == "outputs" ? nodeRect.width : 0),
            y: y + nodeRect.height/2 - ( (portHeight + portYGap) * portAmount - portYGap ) / 2 + (portHeight + portYGap) * i + portHeight/2
        }
    }

    if( !flowID.value ) throw new Error("flowID is not defined")
    const flowPorts = ports[flowID.value]
    if( flowPorts ){
        await Promise.all(Object.entries(flowPorts).map(async ([nodeID, blockPorts]) => {
            if( !nodePositions[nodeID] ) return

            const updatePortPositions = (portType: "inputs" | "outputs") => ["default", ...blockPorts[portType]].map(async (portID, i) => await updatePortPosition(portType, nodeID, blockPorts[portType], portID, i, nodePositions[nodeID]))
    
            await Promise.all([
                ...updatePortPositions("inputs"),
                ...updatePortPositions("outputs"),
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
        [nodeID: string]: {
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
        let isBlockDefaultPortConnected = false

        const toBlockPortPositions = portPositions[toBlockID]
        if( !toBlockPortPositions ) continue
        
        if( !block.inputs || !Object.values(block.inputs).some(input => input.type == "port" && !!input.value) ){
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
            if( input.type == "setting" && isBlockDefaultPortConnected ) continue
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

                if( input.type == "setting" ) isBlockDefaultPortConnected = true
    
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

    const blockPositions = await getNodePositions(getBlockRect)
    const portPositions = await getPortPositions(blockPositions, getBlockRect)
    const newLines = getLines(portPositions)
    lines.value = newLines
}