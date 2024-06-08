import { Flow } from "../model/flow"

type DependencyMap = {
    [nodeID: string]: string[]
}

export function createLayers(flow: Flow, withSpacers = true) {
    const dependencies = createDependencies(flow)
    const layers = createLayersFromDependencies(dependencies, withSpacers)

    return layers
}

function createDependencies(flow: Flow) {
    const dependencies: DependencyMap = {}

    for( const [id, node] of Object.entries(flow.nodes) ){
        if( node.inputs ){
            const connectFromSet = new Set<string>()

            for( const input of Object.values(node.inputs) ){
                if( input.type == "port" ) {
                    if( !input.value ) continue
                    connectFromSet.add(input.value.nodeID)
                }
            }
            
            if( connectFromSet.size == 0 ){
                if( !node.defaultPortNodeID ) throw new Error("defaultPortNodeID is not defined")
                dependencies[id] = [node.defaultPortNodeID]
            }else{
                dependencies[id] = Array.from(connectFromSet)
            }
        }else if( node.defaultPortNodeID ){
            dependencies[id] = [node.defaultPortNodeID]
        }
    }

    return dependencies
}

function createLayersFromDependencies(
    dependencies: DependencyMap,
    withSpacers = false
) {
    type Map = { [blockID: string]: Map | string }

    const maxDepths: { [key: string]: number } = {}
    for( const nodeID of Object.keys(dependencies) ){
        maxDepths[nodeID] = 0
    }

    function makeMap(id: string, depth: number) {
        const children = Object.entries(dependencies)
            .map(([nodeID, parents]) => parents.includes(id) ? nodeID : null)
            .filter((nodeID): nodeID is string => !!nodeID)

        const map: Map = {}
        children.forEach((child) => {
            map[child] = makeMap(child, depth + 1)
        })

        if (maxDepths[id] >= depth) {
            return id
        } else {
            maxDepths[id] = depth
            if (Object.keys(map).length == 0) {
                return id
            } else {
                return map
            }
        }
    }

    const map = makeMap("trigger", 1)
    const maxDepth = Object.values(maxDepths).reduce((tmpMaxDepth, nodeMaxDepth) => tmpMaxDepth < nodeMaxDepth ? nodeMaxDepth : tmpMaxDepth, 0)

    const layers: (string | null)[][] = Array.from({ length: maxDepth }).map(() => []);
    function addBlock(parentID: string, id: string, searchMap: Map | string) {
        const depth = maxDepths[id] - 1
        if (withSpacers) {
            for (let i = maxDepths[parentID]; i < depth; i++) {
                layers[i].push(null)
            }
        }
        layers[depth].push(id)
        if (typeof searchMap != "string") {
            for( const [childID, newMap] of Object.entries(searchMap) ){
                addBlock(id, childID, newMap)
            }
        }
    }

    addBlock("trigger", "trigger", map)
    return layers.map((layer) => {
        const newLayer: typeof layer = []
        
        for( const nodeID of layer ){
            if( !newLayer.includes(nodeID) || nodeID == null ) {
                newLayer.push(nodeID)
            }
        }

        return newLayer
    })
}