<template>
    <div
        v-if="open"
        class="absolute top-0 left-0 w-full h-full">
        <div
          class="w-full h-full"
          @click="open = false"/>
        <div class="absolute top-4 right-4 bg-zinc-900 h-[calc(100%-2rem)] border-zinc-700 border-[1px] rounded-xl w-[calc(100%-500px)] flex flex-col gap-4 text-white p-4">
            <div class="flex flex-row items-start">
              <h1 class="text-3xl font-semibold grow overflow-hidden text-ellipsis">Bbbb</h1>
              <button @click="open = false">
                <i class="bi bi-x text-3xl text-zinc-500"/>
              </button>
            </div>
            
        </div>
    </div>
</template>
<script setup lang="ts">
const open = defineModel<boolean>("open", { required: true })
</script>