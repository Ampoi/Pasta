import { BlockData } from "../model/block"
import { Flow } from "../model/flow"
import { createLayers } from "./createLayers"
import { getAlphabet } from "./getAlphabet"

const getMainCode = (flow: Flow, blocks: { [blockID: string]: BlockData }) => {
    let mainCodeLines: string[]  = []
    
    const layers = createLayers(flow, false).slice(1) as string[][]
    const usedBlockTypes = new Set<string>()

    let n = 0
    const variableIDs: {
        [blockID: string]: {
            [outputID: string]: string
        }
    } = {}

    for( const layer of layers ){
        for( const blockID of layer ){
            const block = flow.blocks[blockID]
            const input: Record<string, any> = {}
            if( block.inputs ){
                Object.entries(block.inputs).forEach(([portID, port]) => {
                    if( port.type === "setting" ){
                        input[portID] = typeof port.value == "string" ? `"${port.value}"` : port.value
                    }else{
                        input[portID] = variableIDs[port.value.blockID][port.value.portID]
                    }
                })
            }
            
            usedBlockTypes.add(block.type)
            
            const blockEntry = Object.entries(blocks).find(([_blockID]) => _blockID === block.type)
            if( !blockEntry ) continue

            const blockTemplate = blockEntry[1]
            
            const outputVariables: { [output: string]: string } = {}
            blockTemplate.outputs.forEach((output) => {
                outputVariables[output.name] = getAlphabet(n)
                n++
            })

            variableIDs[blockID] = outputVariables

            mainCodeLines.push(`const { ${
                Object.entries(outputVariables).map(([outputID, variableID]) => `${ outputID }: ${ variableID }`).join(", ")
            } } = ${block.type}({${
                Object.entries(input).map(([inputID, value]) => `${inputID}: ${value}`).join(", ")
            }})`)
        }
    }

    return {
        mainCode: `const main = () => {\n${mainCodeLines.map(line => `\t${line}`).join("\n")}\n}`,
        usedBlockIDs: Array.from(usedBlockTypes)
    }
}

export const createRunnableCode = (flow: Flow, blocks: { [blockID: string]: BlockData }) => {
    const { usedBlockIDs, mainCode } = getMainCode(flow, blocks)
    
    let importCode = usedBlockIDs.map((blockID) => `import ${blockID} from "../blocks/${blockID}/main"`).join("\n") + "\n\n"
    const code = importCode + mainCode

    return code
}