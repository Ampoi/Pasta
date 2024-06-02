<template>
    <tr>
        <td>
            <Port
                v-if="nodeID != 'trigger'"
                :nodeID
                :name
                :type
                v-model:selectedPort="selectedPort"
                portType="input"/>
        </td>
        <td
            class="flex flex-row gap-2 items-center -ml-3 px-4 py-1 bg-zinc-900 text-zinc-500 border-x-[1px] border-zinc-700 -mr-3"
            :class="{ 'rounded-b-xl border-b-[1px] pb-3': (block && block.inputs ? (block.inputs.length - 1) : 0) == index }">
            <p class="basis-20 whitespace-nowrap text-ellipsis overflow-hidden">
                {{ input.name }}
            </p>
            <button>
                <Icon icon="fluent:arrow-circle-right-12-filled"/>
            </button>
            <input
                type="number"
                class="px-2 py-1 border-[1px] rounded-sm border-zinc-700 bg-transparent grow text-sm"
            />
        </td>
    </tr>
</template>
<script setup lang="ts">
import Port from './port.vue';
import { PortPlace } from '../../utils/connectPorts';
import { Block } from '../../model/block';
import { Icon } from '@iconify/vue/dist/iconify.js';

type PortProps = {
    portType: "input" | "output"
    nodeID: string
} & ({
    name: "default"
    type?: undefined
} | {
    name: string
    type: string
})

defineProps<PortProps & {
    index: number
    block: Block | undefined
    input: {
        name: string
        type: string
    }
}>()

const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })
</script>