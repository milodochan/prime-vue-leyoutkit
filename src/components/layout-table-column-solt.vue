<script setup>
import { computed, ref } from 'vue'
import { columnSlotStore } from '../store'

const props = defineProps({
    template: [String, Object, Function],
    data: Object,
    index: Number
})

// 提供默认空 Map，防止 inject 失败
const isSlot = ref(false)
const toHtml = (content = '', tooltip = '') => ({
    type: 'html',
    content,
    tooltip: String(tooltip || content)
})

const toComponent = (component, result = {}) => ({
    type: 'component',
    component,
    props: result.props || {},
    content: result.content ?? null,
    tooltip: String(result.tooltip || result.content)
})
const resolve = (template, data, index) => {
    if (typeof template === 'function') {
        const result = template(data, index)
        if (result?.component) {
            let comp = result.component

            if (typeof comp === 'string' && columnSlotStore.value.has(comp)) {
                isSlot.value = true
                comp = columnSlotStore.value.get(comp)
            }

            return toComponent(comp, result)
        }

        if (result && typeof result === 'object') {
            return toHtml(result.content ?? '', result.tooltip ?? '')
        }

        return toHtml(String(result ?? ''), '')
    }

    if (template && typeof template === 'object') {
        return toHtml(template.content ?? '', template.tooltip ?? '')
    }

    return toHtml(String(template ?? ''), '')
}
const renderInfo = computed(() => resolve(props.template, props.data, props.index))
</script>

<template>
    <span v-if="renderInfo.type === 'html'" v-tooltip.top="renderInfo.tooltip" v-html="renderInfo.content" />
    <span v-else-if="renderInfo.type === 'component' && renderInfo.tooltip" v-tooltip.top="renderInfo.tooltip">
        <component :is="renderInfo.component"
            v-bind="isSlot ? { content: renderInfo.content, props: renderInfo.props } : renderInfo.props">
            {{ renderInfo.content }}
        </component>
    </span>
    <component v-else :is="renderInfo.component"
        v-bind="isSlot ? { content: renderInfo.content, props: renderInfo.props } : renderInfo.props">
        {{ renderInfo.content }}
    </component>
</template>
