<template>
  <div
    ref="zone"
    class="overflow-hidden relative"
    @mousedown="startMoving"
    @mouseup="stopMoving"
    @mouseleave="stopMoving"
    @mousemove="move"
    @wheel="resize">
    <div
      class="absolute"
      :style="{
        top: `${-position.y}px`,
        left: `${-position.x}px`,
        transform: `scale(${size})`,
      }">
      <slot/>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";

let isMoving = false;
const position = reactive({
  x: 0,
  y: 0,
});

const startMoving = () => (isMoving = true);
const stopMoving = () => (isMoving = false);
const move = (event: MouseEvent) => {
  if (isMoving) {
    position.x -= event.movementX;
    position.y -= event.movementY;
  }
  mousePosition.x = event.x;
  mousePosition.y = event.y;
};

const mousePosition = {
  x: 0,
  y: 0,
};

const size = ref(1);
watch(size, (newValue, oldValue) => {
  const changeRate = newValue / oldValue;

  const { x, y } = mousePosition;

  position.x = (position.x + x * size.value) * changeRate - x * size.value;
  position.y = (position.y + y * size.value) * changeRate - y * size.value;
});

const resizeSpeed = 0.005;
const resizeMin = 0.25;
const resizeMax = 1;

const isCtrlPressed = ref(false);
const ctrlKeys = ["Control", "Meta"];
window.addEventListener("keydown", (event) => {
  if (ctrlKeys.includes(event.key)) isCtrlPressed.value = true;
});
window.addEventListener("keyup", (event) => {
  if (ctrlKeys.includes(event.key)) isCtrlPressed.value = false;
});

const resize = (event: WheelEvent) => {
  if (!isCtrlPressed.value) return;
  event.preventDefault();
  size.value += event.deltaY * resizeSpeed;
  if (size.value < resizeMin) size.value = resizeMin;
  if (size.value > resizeMax) size.value = resizeMax;
};

const zone = ref<HTMLElement>();

onMounted(() => {
  if (!zone.value) throw new Error("Zoneの値がないです！！");
  position.x = -zone.value.clientWidth / 2;
  position.y = -zone.value.clientHeight / 2;
});
</script>