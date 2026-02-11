<script setup>
import { inject, markRaw, onBeforeUnmount, onMounted, useSlots } from 'vue'

const props = defineProps({
    name: {
        type: String,
        required: true
    }
})

const slotMap = inject('dialogSlotMap')
const slots = useSlots()

onMounted(() => {
    slotMap.value.set(props.name, markRaw({ render: () => slots.default?.() }))
})
onBeforeUnmount(() => {
    slotMap.value.delete(props.name)
})

</script>

<template>
    <!-- 不渲染任何内容 -->
</template>
