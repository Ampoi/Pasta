<template>
    <div
        class="overflow-hidden relative"
        @mousedown="startMoving"
        @mouseup="stopMoving"
        @mouseleave="stopMoving"
        @mousemove="move"
        @wheel="resize"
        ref="zone">
        <slot
            :position="position"
            :size="size"/>
    </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

let isMoving = false
const position = reactive({
    x: 0,
    y: 0
})

const startMoving = () => isMoving = true
const stopMoving = () => isMoving = false
const move = (event: MouseEvent) => {
    if(isMoving){
        position.x -= event.movementX
        position.y -= event.movementY
    }
    mousePosition.x = event.x
    mousePosition.y = event.y
}

const mousePosition = {
    x: 0,
    y: 0
}

const size = ref(1)
watch(size, (newValue, oldValue) => {
    const changeRate = newValue / oldValue
    
    const { x, y } = mousePosition

    position.x = (position.x + x * size.value) * changeRate - x * size.value
    position.y = (position.y + y * size.value) * changeRate - y * size.value
})

const resizeSpeed = 0.005
const resizeMin = 0.25

const resize = (event: WheelEvent) => {
    size.value += event.deltaY * resizeSpeed
    if(size.value < resizeMin) size.value = resizeMin
}

const zone = ref<HTMLElement>()

onMounted(() => {
    if( !zone.value ) throw new Error("Zoneの値がないです！！")
    position.x = -zone.value.clientWidth/2
    position.y = -zone.value.clientHeight/2
})
</script>