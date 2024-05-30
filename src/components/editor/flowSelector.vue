<template>
    <div class="relative w-52">
        <div class="bg-transparent py-1 pl-2 pr-1 rounded-md outline-none border-[1px] border-zinc-700 basis-60 flex flex-row gap-1">
            <Icon
                icon="fluent:flow-24-regular"
                class="text-zinc-500 text-lg my-auto"/>
            <p class="text-white grow whitespace-nowrap overflow-hidden text-ellipsis">{{ flowID }}</p>
            <button
                class="hover:bg-zinc-800 px-0.5 rounded-sm"
                @click="showModal = !showModal">
                <Icon
                    icon="fluent:chevron-down-12-regular"
                    class="text-zinc-500 text-sm"/>
            </button>
        </div>
        <div
            class="absolute -bottom-1 left-0 translate-y-full rounded-md border-[1px] border-zinc-700 bg-zinc-900 z-10 text-white w-full max-h-40 overflow-y-auto flex flex-col"
            v-if="showModal">
            <button
                v-for="id in flowIDs"
                class="flex flex-row gap-2 items-center p-2 select-none hover:bg-zinc-800"
                @click="() => select(id)">
                <Icon
                    icon="fluent:flow-24-regular"
                    class="text-zinc-500 text-lg"/>
                <p class="text-white grow whitespace-nowrap overflow-hidden text-ellipsis text-left">{{ id }}</p>
            </button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const flowID = defineModel<string>("flowID")
defineProps<{
    flowIDs: string[]
}>()

const showModal = ref(false)

const select = (id: string) => {
    flowID.value = id
    showModal.value = false
}
</script>