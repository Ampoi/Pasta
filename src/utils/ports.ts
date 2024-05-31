import { reactive } from "vue";

export const ports = reactive<{
    [flowID: string]: {
        [blockID: string]: Record<"inputs" | "outputs", string[]>
    }
}>({})