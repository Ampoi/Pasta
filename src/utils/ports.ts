import { reactive } from "vue";

export const ports = reactive<{
    [flowIndex: number]: {
        [blockID: string]: Record<"args" | "returnValues", string[]>
    }
}>({})