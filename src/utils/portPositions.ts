import { reactive } from "vue";

export const portPositions = reactive<{
    [blockID: string]: {
        [portID: string]: Record<"x" | "y", number>
    }
}>({})