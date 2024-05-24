import { Project } from "../model/project"

type DependencyMap = {
    trigger: string[]
    [key: string]: string[]
}

export function createLayers(project: Project["flows"][number]) {
    const dependencies: {
        trigger: string[]
        [id: string]: string[]
    } = {
        trigger: Object.values(project.trigger.connectedPorts).map((port) => Object.keys(port)).flat()
    }

    Object.entries(project.blocks).forEach(([id, value]) => {
        dependencies[id] = Object.values(value.connectedPorts).map((port) => Object.keys(port)).flat()
    })

    return createLayersFromDependencies(dependencies, true)
}

function createLayersFromDependencies(
    dependencies: DependencyMap,
    withSpacers = false
) {
    type Map = { [key: string]: Map | string }

    const maxDepths: { [key: string]: number } = {}
    Object.keys(dependencies).forEach((key) => { maxDepths[key] = 0 })

    function makeMap(id: string, depth: number) {
        const children = dependencies[id]

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