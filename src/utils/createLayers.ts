type DependencyMap = { [key: string]: string[] };

export function createLayers(dependencies: DependencyMap): string[][] {
    const layers: string[][] = [];
    const visited = new Set<string>();

    const allKeys = new Set(Object.keys(dependencies));
    const allTargets = new Set<string>();
    Object.values(dependencies).forEach(targets => targets.forEach(target => allTargets.add(target)));

    const sources = Array.from(allKeys).filter(x => !allTargets.has(x));
    
    function visit(node: string, currentLayer: number) {
        if (visited.has(node)) return;
        visited.add(node);
        
        if (!layers[currentLayer]) layers[currentLayer] = [];
        layers[currentLayer].push(node);

        if (dependencies[node]) {
            dependencies[node].forEach(child => {
                visit(child, currentLayer + 1);
            });
        }
    }

    // 各ソースから探索開始
    sources.forEach(source => visit(source, 0));

    return layers;
}