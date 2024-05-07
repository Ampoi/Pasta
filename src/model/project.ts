import type { Block } from "./block"

export type Project = {
    trigger: Block
    blocks: Record<string, Block>
}