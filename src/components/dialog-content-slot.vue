<script setup>
import { markRaw, onBeforeUnmount, onMounted, useSlots } from 'vue'
import { dialogSlotStore } from '../store'

const props = defineProps({
    name: {
        type: String,
        required: true
    }
})

const slots = useSlots()

onMounted(() => {
    dialogSlotStore.value.set(
        props.name,
        markRaw({
            render: () => slots.default?.()
        })
    )
})
onBeforeUnmount(() => {
    dialogSlotStore.value.delete(props.name)
})

</script>

<template>
    <!-- 不渲染任何内容 -->
</template>
