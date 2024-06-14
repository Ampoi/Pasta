<template>
    <div class="flex flex-row items-center gap-2">
        <h2 class="text-lg font-semibold basis-14">入力</h2>
        <div class="grow bg-black border-[1px] border-zinc-700 px-1.5 py-1 flex flex-row gap-1.5 rounded-lg overflow-hidden">
            <button
                class="bg-zinc-900 border-zinc-700 border-[1px] size-6 grid rounded-md place-content-center text-sm box-content"
                @click="addInput">
                <Icon icon="fluent:add-16-filled"/>
            </button>
            <div
                class="flex flex-row grow gap-1.5 overflow-x-auto"
                style="scrollbar-width: none;"
                id="inputs">
                <button
                    v-for="input in inputs"
                    class="flex flex-row gap-1.5 items-baseline bg-zinc-900 border-zinc-700 border-[1px] rounded-md px-1 py-1 select-none">
                    <div class="size-4 bg-blue-500 rounded-[4px] text-xs grid place-content-center">
                        {{ input.type[0].toUpperCase() }}
                    </div>
                    <p class="text-sm leading-none">{{ input.name }}</p>
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
#inputs::-webkit-scrollbar {
    display: none;
}
</style>
<script setup lang="ts">
import { Icon } from "@iconify/vue/dist/iconify.js";
import { codeData } from "../../../hooks/code"
import { computed } from "vue";

const inputs = computed({
    get(){
        return codeData.value?.args
    },
    set(value){
        if( !value ) return
        if( !codeData.value ) throw new Error("Code data is not defined")

        codeData.value = {
            ...codeData.value,
            args: value
        }
    }
})

const addInput = () => {
    inputs.value = [
        ...(inputs.value ?? []),
        {
            name: "input",
            type: "string"
        }
    ]
}
</script>