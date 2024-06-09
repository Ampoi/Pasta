<template>
    <textarea
        class="bg-black w-full h-full border-[1px] border-zinc-700 rounded-md resize-none p-4 text-white"
        v-model="code"/>
</template>
<script setup lang="ts">
import { code } from "../../hooks/code"
</script>