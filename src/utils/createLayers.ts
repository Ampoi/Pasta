import { Flow } from "../model/flow"

type DependencyMap = {
    [key: string]: string[]
}

export function createLayers(flow: Flow, withSpacers = true) {
    const dependencies = createDependencies(flow)
    const layers = createLayersFromDependencies(dependencies, withSpacers)

    return layers
}

function createDependencies(flow: Flow) {
    const dependencies: DependencyMap = {}

    Object.entries(flow.nodes).forEach(([id, node]) => {
        if( node.inputs ){
            const connectFromSet = new Set<string>()
    
            Object.values(node.inputs).forEach((input) => {
                if( input.type == "port" ) {
                    if( !input.value ) return
                    connectFromSet.add(input.value.nodeID)
                }
            })
            
            if( connectFromSet.size == 0 ){
                if( !node.defaultPortNodeID ) throw new Error("defaultPortNodeID is not defined")
                dependencies[id] = [node.defaultPortNodeID]
            }else{
                dependencies[id] = Array.from(connectFromSet)
            }
        }else if( node.defaultPortNodeID ){
            dependencies[id] = [node.defaultPortNodeID]
        }
    })

    return dependencies
}

function createLayersFromDependencies(
    dependencies: DependencyMap,
    withSpacers = false
) {
    type Map = { [blockID: string]: Map | string }

    const maxDepths: { [key: string]: number } = {}
    Object.keys(dependencies).forEach((key) => { maxDepths[key] = 0 })

    function makeMap(id: string, depth: number) {
        const children = Object.entries(dependencies)
            .map(([blockID, parents]) => parents.includes(id) ? blockID : null)
            .filter((blockID): blockID is string => !!blockID)

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
    const maxDepth = (() => {
        let tmp = 0
        Object.values(maxDepths).forEach((depth) => {
            if (depth > tmp) {
                tmp = depth
            }
        })
        return tmp
    })();

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
            Object.entries(searchMap).forEach(([childID, newMap]) => addBlock(id, childID, newMap))
        }
    }

    addBlock("trigger", "trigger", map)
    return layers.map((layer) => {
        const newLayer: typeof layer = []
        layer.forEach((item) => {
            if (!newLayer.includes(item) || item == null) {
                newLayer.push(item)
            }
        })
        return newLayer
    })
}