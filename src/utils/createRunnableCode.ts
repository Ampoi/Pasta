import { getCodeBlock, useCodeBlock } from "../hooks/useCodeBlock"
import { Block } from "../model/block"
import { Flow } from "../model/flow"
import { createLayers } from "./createLayers"
import { getAlphabet } from "./getAlphabet"

class UniqueVariable {
    private n = 0

    public create(){
        const alphabet = getAlphabet(this.n)
        this.n++
        return alphabet
    }

    public reset(){
        this.n = 0
    }
}

const uniqueVariable = new UniqueVariable()

const getMainCode = async (
    flow: Flow,
    blocks: { [blockID: string]: Block },
    triggerOutputs: { type: string, name: string }[]
) => {
    let mainCodeLines: string[]  = []
    
    const layers = createLayers(flow, false).slice(1) as string[][]
    const usedBlockIDs = new Set<string>()
    const usedCodeIDs = new Set<string>()

    const variableIDs: {
        [blockID: string]: {
            [outputID: string]: string
        }
    } = {}

    variableIDs.trigger = {}
    triggerOutputs.forEach((output) => {
        variableIDs.trigger[output.name] = uniqueVariable.create()
    })

    for await ( const layer of layers ){
        for await ( const nodeID of layer ){
            const node = flow.nodes[nodeID]
            const input: Record<string, any> = {}
            if( node.inputs ){
                Object.entries(node.inputs).forEach(([portID, port]) => {
                    if( port.type === "setting" ){
                        input[portID] = typeof port.value == "string" ? `"${port.value}"` : port.value
                    }else{
                        if( !port.value ){
                            input[portID] = undefined
                        }else{
                            input[portID] = variableIDs[port.value.nodeID][port.value.portID]
                        }
                    }
                })
            }

            let blockID: string
            let block: Block

            if( node.code == false ){
                usedBlockIDs.add(node.blockID)
                
                const blockEntry = Object.entries(blocks).find(([_blockID]) => _blockID === node.blockID)
                if( !blockEntry ) continue
    
                block = blockEntry[1]
                blockID = node.blockID
            }else{
                usedCodeIDs.add(node.codeID)

                block = await getCodeBlock(node.codeID)
                blockID = node.codeID
            }

            const outputVariables: { [output: string]: string } = {}
                block.outputs.forEach((output) => {
                outputVariables[output.name] = uniqueVariable.create()
            })
            
            variableIDs[nodeID] = outputVariables

            mainCodeLines.push(`const { ${
                Object.entries(outputVariables).map(([outputID, variableID]) => `${ outputID }: ${ variableID }`).join(", ")
            } } = ${blockID}(${
                Object.entries(input).map(([_inputID, value]) => value).join(", ")
            })`)
        }
    }

    return {
        mainCode: `const main = (${
            Object.keys(variableIDs.trigger).length == 0 ? "" : `{${
                Object.entries(variableIDs.trigger).map(([outputID, variableName]) => `${outputID}: ${variableName}`).join(", ")
            }}`
        }) => {\n${
            mainCodeLines.map(line => `\t${line}`).join("\n")
        }\n}`,
        usedBlockIDs: Array.from(usedBlockIDs),
        usedCodeIDs: Array.from(usedCodeIDs)
    }
}

const getExecuteCode = (flow: Flow, blocks: Record<string, Block>) => {
    const triggerBlockID = flow.nodes.trigger.blockID
    if( typeof triggerBlockID != "string" ) throw new Error("Trigger block id is not string");

    const triggerBlock = blocks[triggerBlockID]
    if( !triggerBlock ) throw new Error("Trigger block is not found");

    if( triggerBlock.trigger == false ) throw new Error("Trigger block is not trigger type");
    
    return { triggerBlockID, triggerOutputs: triggerBlock.outputs }
}

export const createRunnableCode = async (
    flow: Flow,
    flowID: string,
    blocks: { [blockID: string]: Block }
) => {
    uniqueVariable.reset()
    
    const { triggerBlockID, triggerOutputs } = getExecuteCode(flow, blocks)
    const {
        usedBlockIDs: usedBlockIDsInMainCode,
        usedCodeIDs,
        mainCode
    } = await getMainCode(flow, blocks, triggerOutputs)

    const usedBlockIDs = [triggerBlockID, ...usedBlockIDsInMainCode]
    
    const importBlockLines = usedBlockIDs.map((blockID) => `import ${blockID} from "../blocks/${blockID}/main"`).join("\n") + "\n\n"
    const importCodeLines = usedCodeIDs.map((codeID) => `import ${codeID} from "../flows/${flowID}/codes/${codeID}"`).join("\n") + "\n\n"
    const executeLines = `${triggerBlockID}(main)`
    
    const code = importBlockLines + importCodeLines + mainCode + "\n\n" + executeLines

    return code
}