<template>
    <svg
        class="w-full h-full absolute top-0 left-0"
        ref="linesArea">
        <path
            v-for="line in lines"
            :d="`
                M ${line.from.x} ${line.from.y} C ${line.from.x + 100} ${line.from.y},
                ${line.to.x - 100} ${line.to.y}, ${line.to.x} ${line.to.y}`"
            stroke="#D8DCE2" fill="none" stroke-width="2"/>
    </svg>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { Block } from '../model/block';
import { portPositions } from '../utils/portPositions';

const props = defineProps<{
    blocks: Record<string, Block>
}>()

type Position = Record<"x" | "y", number>
type Line = {
    from: Position
    to: Position
}

const linesArea = ref<HTMLElement>()
const lines = ref<Line[]>([])
watch(portPositions, updateLines)

function updateLines(){
    if( !linesArea.value ) throw new Error("ラインエリアが指定されてないです")
 
    const { top, left } = linesArea.value.getBoundingClientRect()
    const getAdjustedPosition = (position: Position): Position => {
        return {
            x: position.x - left,
            y: position.y - top
        }
    }

    lines.value = Object.entries(props.blocks).map(([blockID, block]) => {
        return Object.entries(block.ports).map(([portID, port]) => {
            return Object.entries(port).map<Line | undefined>(([toBlockID, argPortID]) => {
                if(
                    !portPositions[blockID] ||
                    !portPositions[blockID][portID] ||
                    !portPositions[toBlockID] ||
                    !portPositions[toBlockID][argPortID]
                ) return undefined

                return {
                    from: getAdjustedPosition(portPositions[blockID][portID]),
                    to: getAdjustedPosition(portPositions[toBlockID][argPortID])
                }
            })
        })
    }).flat(3).filter((line): line is Line => !!line)
}
</script>