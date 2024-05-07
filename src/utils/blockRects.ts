import { reactive } from "vue";

export const blockRects = reactive<{
    [blockID: string]: {
        height: number
        width: number
    }
}>({})

export const updateBlockRect = (blockID: string, element?: HTMLElement) => {
    if( !element ) throw new Error("Element not found for blockID: " + blockID)
    blockRects[blockID] = {
        height: element.clientHeight,
        width: element.clientWidth
    }
}