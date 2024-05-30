<template>
  <div class="flex flex-row" ref="block">
    <!--引数-->
    <div
      class="flex flex-col items-end gap-2 max-w-[160px] -mr-2 z-10 my-auto py-3"
      v-if="blockID != 'trigger'"
    >
      <Port
        :defaultPort="true"
        @click="() => onPortClick('arg', 'default')"
        :selected="isPortSelected('arg', 'default')"/>
      <Port
        v-for="arg in blockData?.input"
        :blockID
        :type="arg.type"
        :name="arg.name"
        :reverse="true"
        @click="() => onPortClick('arg', arg.name)"
        :selected="isPortSelected('arg', arg.name)"/>
    </div>

    <div
      class="flex flex-col justify-center gap-2 grow bg-zinc-900 p-3 rounded-xl w-80 border-zinc-700 border-[1px]"
    >
      <div class="flex flex-row items-center gap-2">
        <div
          class="text-white size-[30px] border-[1px] border-zinc-700 grid place-content-center rounded-md box-content"
          :style="{ background: blockData?.icon.color }"
        >
          <Icon
            :icon="blockData?.icon.value ?? 'fluent:question-16-filled'"
            class="text-lg"
          />
        </div>
        <input
          type="text"
          class="px-2 py-1 rounded-md bg-transparent text-white outline-none border-[1px] border-zinc-700 grow"
          :value="blockSettings.title"
        />
      </div>
      <div
        class="grow border-zinc-700 text-zinc-500 border-[1px] rounded-md flex flex-col justify-center"
        v-if="blockData && 0 < (blockData.settings?.length ?? 0)"
      >
        <div
          v-for="setting in blockData?.settings"
          class="flex flex-row gap-2 items-center text-sm p-2"
        >
          <p class="basis-20 whitespace-nowrap text-ellipsis overflow-hidden">
            {{ setting.name }}
          </p>
          <input
            type="number"
            class="px-2 py-1 border-[1px] rounded-sm border-zinc-700 bg-transparent grow"
          />
        </div>
      </div>
    </div>

    <!--返り値-->
    <div
      class="flex flex-col items-start gap-2 max-w-[160px] -ml-2 z-10 my-auto py-3"
    >
      <Port
        :defaultPort="true"
        @click="() => onPortClick('returnValue', 'default')"
        :selected="isPortSelected('returnValue', 'default')"/>
      <Port
        v-for="returnValue in blockData?.output"
        :blockID
        :type="returnValue.type"
        :name="returnValue.name"
        @click="() => onPortClick('returnValue', returnValue.name)"
        :selected="isPortSelected('returnValue', returnValue.name)"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from "vue";
import { Block, BlockExposedData, BlockData } from "../model/block";
import Port from "./block/port.vue";
import { ports } from "../utils/ports";
import { Icon } from "@iconify/vue";
import { BlockRect } from "../model/block";
import { Callback } from "../model/utils";
import { readTextFile } from "@tauri-apps/api/fs";

const props = defineProps<{
  blockID: string;
  blockSettings: Block;
  flowID: string;
  projectPath: string;
}>()

const emit = defineEmits<{
  (e: "connectPorts", from: PortPlace, to: PortPlace): void
}>()

type Port = {
  type: string;
  name: string;
};

const block = ref<HTMLElement>();

const blockPath = computed(() => `${props.projectPath}/blocks/${props.blockSettings.type}/main.json`);
const blockData = ref<BlockData | undefined>();
watch(() => props.blockSettings, async () => {
  try {
    const fileText = await readTextFile(blockPath.value);
    const fileJSON = JSON.parse(fileText) as BlockData;
    blockData.value = fileJSON;
  } catch (error) {
    console.warn(error);
  }
}, { immediate: true })()

watchEffect(() => {
  if (!ports[props.flowID]) ports[props.flowID] = {};

  const input = blockData.value?.input ?? [];
  const output = blockData.value?.output ?? [];
  ports[props.flowID][props.blockID] = {
    args: input.map((arg) => arg.name),
    returnValues: output.map((returnValue) => returnValue.name),
  };
});

let isMounted = false
let getBlockRectQue: (() => void) | undefined = undefined

const getBlockRect = (callback: Callback<BlockRect> ) => {
  if( !isMounted ){
    getBlockRectQue = () => getBlockRect(callback)
  }else{
    const blockElement = block.value;
    if( !blockElement ) throw new Error("blockElement is not defined")
    callback({
      height: blockElement.clientHeight,
      width: blockElement.clientWidth,
    })
  }
}

onMounted(() => {
  isMounted = true
  if( getBlockRectQue ){
    getBlockRectQue()
    getBlockRectQue = undefined
  }
})

type PortPlace = {
  type: "arg" | "returnValue"
  blockID: string
  portID: string
}

const selectedPort = defineModel<PortPlace | null>("selectedPort")

const onPortClick = (type: "arg" | "returnValue", portID: string) => {
  const clickedPort = {
    type,
    blockID: props.blockID,
    portID
  }

  if( !selectedPort.value ){
    selectedPort.value = clickedPort
  }else{
    if( clickedPort.type == "arg" ){
      emit("connectPorts", selectedPort.value, clickedPort)
    }else{
      emit("connectPorts", clickedPort, selectedPort.value)
    }
    selectedPort.value = null
  }
}

//TODO:"arg" | "returnValue"をまとめる
const isPortSelected = (type: "arg" | "returnValue", portID: string): boolean => (
  !!(selectedPort.value) &&
  (type == selectedPort.value.type) &&
  (props.blockID == selectedPort.value.blockID) &&
  (portID == selectedPort.value.portID)
)

defineExpose<BlockExposedData>({
  id: props.blockID,
  getBlockRect
})
</script>
