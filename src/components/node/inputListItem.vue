<template>
    <tr>
        <td>
            <Port
                v-if="nodeID != 'trigger' && input.type == 'port'"
                :nodeID
                :name="blockInput.name"
                :type="blockInput.type"
                v-model:selectedPort="selectedPort"
                portType="input"/>
        </td>
        <td
            class="flex flex-row gap-2 items-center -ml-3 px-4 py-1 bg-zinc-900 text-zinc-500 border-x-[1px] border-zinc-700 -mr-3"
            :class="{ 'rounded-b-xl border-b-[1px] pb-3': (block.inputs ? block.inputs.length : 0) - 1 == index }">
            <p class="basis-20 whitespace-nowrap text-ellipsis overflow-hidden">
                {{ blockInput.name }}
            </p>
            <button
                :class="{
                    'text-blue-500': input.type == 'port'
                }">
                <Icon icon="fluent:arrow-circle-right-12-filled"/>
            </button>
            <input
                type="number"
                class="px-2 py-1 border-[1px] rounded-md border-zinc-700 bg-transparent grow text-sm text-white outline-none"
                :disabled="input.type == 'port'"
                :class="{
                    'opacity-40': input.type == 'port'
                }"
                :value="input.value"
            />
        </td>
    </tr>
</template>
<script setup lang="ts">
import Port from './port.vue';
import { PortPlace } from '../../utils/connectPorts';
import { Block } from '../../model/block';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Node, Input } from '../../model/node';
import { computed } from 'vue';

type PortProps = {
    portType: "input" | "output"
    nodeID: string
}

const props = defineProps<PortProps & {
    index: number
    block: Block
    blockInput: {
        name: string
        type: string
    } | {
        name: "default"
        type?: undefined
    }
}>()

const selectedPort = defineModel<PortPlace | null>("selectedPort", { required: true })

const node = defineModel<Node>("node", { required: true })

const input = computed<Input>({
    get(){
        if( node.value.inputs?.[props.blockInput.name] ){
            return node.value.inputs[props.blockInput.name]
        }else{
            return {
                type: "setting",
                value: "default"
            }
        }
    },
    set(newInput){
        if( node.value.inputs ){
            node.value.inputs[props.blockInput.name] = newInput
        }else{
            node.value.inputs = {
                [props.blockInput.name]: newInput
            }
        }
    }
})
</script>