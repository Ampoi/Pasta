<template>
    <div class="flex flex-col p-2 gap-2 w-[calc(100%+2rem)] h-40 bg-zinc-900 border-[1px] border-zinc-700 rounded-xl text-white">
        <input
            type="text"
            class="rounded-md border-[1px] border-zinc-700 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-zinc-500"
            placeholder="ブロックを検索...">
        <div class="grow flex flex-col gap-1 overflow-y-auto">
            <div class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg">
                <div class="size-5 rounded-md bg-blue-500 grid place-content-center">
                    <Icon
                        icon="fluent:add-12-regular"
                        class="text-xs"/>
                </div>
                <p class="text-sm">sum</p>
            </div>
            <div class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg">
                <div class="size-5 rounded-md bg-blue-500 grid place-content-center">
                    <Icon
                        icon="fluent:add-12-regular"
                        class="text-xs"/>
                </div>
                <p class="text-sm">sum</p>
            </div>
            <div class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg">
                <div class="size-5 rounded-md bg-blue-500 grid place-content-center">
                    <Icon
                        icon="fluent:add-12-regular"
                        class="text-xs"/>
                </div>
                <p class="text-sm">sum</p>
            </div>
            <div class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg">
                <div class="size-5 rounded-md bg-blue-500 grid place-content-center">
                    <Icon
                        icon="fluent:add-12-regular"
                        class="text-xs"/>
                </div>
                <p class="text-sm">sum</p>
            </div>
            <div class="flex flex-row gap-2 items-center hover:bg-zinc-800 p-1 rounded-lg">
                <div class="size-5 rounded-md bg-blue-500 grid place-content-center">
                    <Icon
                        icon="fluent:add-12-regular"
                        class="text-xs"/>
                </div>
                <p class="text-sm">sum</p>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
</script>