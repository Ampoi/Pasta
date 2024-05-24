import type { Block } from "./block"

export type Project = {
    title: string
    trigger: Block
    blocks: Record<string, Block>
}