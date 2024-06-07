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
            <button
                :class="{ 'text-blue-500': input.type == 'port' }"
                @click="toggleBlockType">
                <Icon icon="fluent:arrow-circle-right-12-filled"/>
            </button>
            <p class="basis-36 whitespace-nowrap text-ellipsis overflow-hidden">
                {{ blockInput.name }}
            </p>
            <input
                type="number"
                class="px-2 py-1 border-[1px] rounded-md border-zinc-700 bg-transparent grow text-sm text-white outline-none"
                :disabled="input.type == 'port'"
                :class="{ 'opacity-40': input.type == 'port' }"
                v-model="inputSettingValue"
            />
        </td>
    </tr>
</template>
<script setup lang="ts">
import Port from './port.vue';
import { Block } from '../../model/block';
import { Icon } from '@iconify/vue/dist/iconify.js';
import { Node, Input } from '../../model/node';
import { computed } from 'vue';
import { PortPlace } from '../../hooks/flow';

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
        const inputInNode = node.value.inputs?.[props.blockInput.name]
        
        if( inputInNode ){
            return inputInNode
        }else{
            const defaultInput: Input = {
                type: "setting",
                value: undefined
            }
            return defaultInput
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

const inputSettingValue = computed<any>({
    get(){
        return input.value.value
    },
    set(newValue){
        if( input.value.type != "setting" ) throw new Error("Input is not a setting")
        const newInput = { ...input.value, value: newValue }
        input.value = newInput
    }
})

const toggleBlockType = () => {
    if( input.value.type == "port" ){
        input.value = { type: "setting", value: undefined }
    }else{
        input.value = { type: "port", value: undefined }
    }
}
</script>