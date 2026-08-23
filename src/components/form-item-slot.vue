<script setup>
import { markRaw, onBeforeUnmount, onMounted, useSlots, defineEmits } from 'vue'
import { formSlotStore } from '../store'

const slots = useSlots()
const emit = defineEmits(['update'])
const props = defineProps({
    name: {
        type: String,
        required: true
    }
})

onBeforeUnmount(() => formSlotStore.value.delete(props.name))
onMounted(() => {
    const slotRender = slots.default
    // 保存一个真正的函数式组件
    formSlotStore.value.set(
        props.name,
        markRaw({
            // 这里返回的是函数式组件对象
            setup(props, { emit, attrs }) {
                // console.log(attrs)
                // console.log(emit)
                return () => slotRender?.({
                    props: { ...props, ...attrs.props },   // 外部传入的数据都在 attrs
                    data: attrs.data,
                    emit
                })
            },
            emits: ['update']
        })
    )
})
</script>

<template>
    <!-- 不渲染任何内容 -->
</template>
