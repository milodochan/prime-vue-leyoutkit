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

onMounted(async () => {
    // 保存一个真正的函数式组件
    const slotRender = slots.default
    dialogSlotStore.value.set(
        props.name,
        markRaw({
            // 这里返回的是函数式组件对象
            setup(props, { attrs }) {
                return () => slotRender?.({
                    props: { ...props, ...attrs.props },   // 外部传入的数据都在 attrs
                    data: attrs
                })
            }
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
