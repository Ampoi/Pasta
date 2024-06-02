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

const getMainCode = (flow: Flow, blocks: { [blockID: string]: Block }, triggerOutputs: { type: string, name: string }[] ) => {
    let mainCodeLines: string[]  = []
    
    const layers = createLayers(flow, false).slice(1) as string[][]
    const usedBlockTypes = new Set<string>()

    const variableIDs: {
        [blockID: string]: {
            [outputID: string]: string
        }
    } = {}

    variableIDs.trigger = {}
    triggerOutputs.forEach((output) => {
        variableIDs.trigger[output.name] = uniqueVariable.create()
    })

    for( const layer of layers ){
        for( const blockID of layer ){
            const block = flow.nodes[blockID]
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
                outputVariables[output.name] = uniqueVariable.create()
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
        mainCode: `const main = (${
            Object.keys(variableIDs.trigger).length == 0 ? "" : `{${
                Object.entries(variableIDs.trigger).map(([outputID, variableName]) => `${outputID}: ${variableName}`).join(", ")
            }}`
        }) => {\n${
            mainCodeLines.map(line => `\t${line}`).join("\n")
        }\n}`,
        usedBlockIDs: Array.from(usedBlockTypes)
    }
}

const getExecuteCode = (flow: Flow, blocks: Record<string, Block>) => {
    const triggerBlockID = flow.nodes.trigger.type
    if( typeof triggerBlockID != "string" ) throw new Error("Trigger block id is not string");

    const triggerBlock = blocks[triggerBlockID]
    if( !triggerBlock ) throw new Error("Trigger block is not found");

    if( triggerBlock.trigger == false ) throw new Error("Trigger block is not trigger type");
    
    return { triggerBlockID, triggerOutputs: triggerBlock.outputs }
}

export const createRunnableCode = (flow: Flow, blocks: { [blockID: string]: Block }) => {
    uniqueVariable.reset()
    
    const { triggerBlockID, triggerOutputs } = getExecuteCode(flow, blocks)
    const { usedBlockIDs: usedBlockIDsInMainCode, mainCode } = getMainCode(flow, blocks, triggerOutputs)

    const usedBlockIDs = [triggerBlockID, ...usedBlockIDsInMainCode]
    
    const importCode = usedBlockIDs.map((blockID) => `import ${blockID} from "../blocks/${blockID}/main"`).join("\n") + "\n\n"
    const executeCode = `${triggerBlockID}(main)`
    const code = importCode + mainCode + "\n\n" + executeCode

    return code
}