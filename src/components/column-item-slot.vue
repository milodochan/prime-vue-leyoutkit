<script setup>
import { inject, markRaw, onBeforeUnmount, onMounted, useSlots } from 'vue'

const props = defineProps({
    name: {
        type: String,
        required: true
    }
})

const slotMap = inject('columnSlotMap')
const slots = useSlots()

onMounted(() => {
    const slotRender = slots.default
    // 保存一个真正的函数式组件
    slotMap.value.set(
        props.name,
        markRaw({
            // 这里返回的是函数式组件对象
            setup(props, { attrs }) {
                // console.log(attrs)
                // console.log(attrs.content)
                return () => slotRender?.({
                    props: props,   // 外部传入的数据都在 attrs
                    attrs: attrs.props,
                    content: attrs.content
                })
            }
        })
    )
})

onBeforeUnmount(() => {
    slotMap.value.delete(props.name)
})

</script>

<template>
    <!-- 不渲染任何内容 -->
</template>
