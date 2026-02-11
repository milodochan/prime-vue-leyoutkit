<script setup>
import { ref, inject, computed } from 'vue'
import { FormEnum } from '../enum/FormEnum'

const props = defineProps({
    invalid: Boolean,
    message: String,
    item: Object,
    data: Object
})

// 配置和初始数据
const formData = props.data
const disabledLabel = props.item?.disabledLabel || false
const field = props.item?.field
const fieldType = props.item?.fieldType
const fieldAttr = computed(() => {
    const item = props.item
    const attrs = item?.fieldAttr
    if (item.attrFunc) {
        let newAttrs = item.attrFunc(formData, item.fieldAttr)
        Object.assign(attrs, newAttrs)
    }
    return attrs
})
// isSlot
const isSlot = ref(false)
// 提供默认空 Map，防止 inject 失败
const formSlotMap = inject('formSlotMap', ref(new Map()))
// 当前内容组件
const component = computed(() => {
    const comp = props.item.component
    if (!comp) return null

    // 真实组件对象 或者 defineAsyncComponent
    if (typeof comp === 'object' || typeof comp === 'function') {
        return comp
    }

    // 是字符串 key，尝试从 slotMap 查找组件
    if (typeof comp === 'string' && formSlotMap.value.has(comp)) {
        isSlot.value = true
        return formSlotMap.value.get(comp)
    }

    return null
})
// 表单组件事件
const onEvent = (val) => {
    props.item.command(val, props.item, formData)
}
// 组件更新
const update = (val) => {
    formData[props.item.field] = val
    onEvent(val)
}
</script>

<template>
    <div class="flex flex-col gap-1">
        <label :for="field" v-if="!disabledLabel">{{ fieldAttr.label }}</label>
        <!-- ✅ 有 template：渲染动态组件, 此处判断是插槽还是组件  决定使用v-bind试试props -->
        <component v-if="component" :is="component" @update="(val) => update(val)"
            v-bind="isSlot ? { data: formData, fieldAttr: fieldAttr } : formData" />

        <!--数字输入框-->
        <InputNumber v-if="fieldType === FormEnum.INPUT_NUMBER" v-model="formData[field]" :name="field"
            v-bind="fieldAttr" />

        <!--文本输入框-->
        <InputText v-if="fieldType === FormEnum.INPUT_TEXT" v-model="formData[field]" :name="field"
            v-bind="fieldAttr" />

        <!--富文本-->
        <Textarea v-if="fieldType === FormEnum.INPUT_TEXTAREA" v-model="formData[field]" :name="field"
            v-bind="fieldAttr" />

        <!--日历-->
        <DatePicker v-if="fieldType === FormEnum.DATE_PICKER" v-model="formData[field]" :name="field"
            dateFormat="yy-mm-dd" showTime hourFormat="24" v-bind="fieldAttr" />

        <!--单选-->
        <RadioButtonGroup v-if="fieldType === FormEnum.RADIO_BUTTON" v-model="formData[field]" :name="field"
            class="flex flex-wrap gap-4" v-bind="fieldAttr">
            <div v-if="fieldAttr.options" v-for="(option, o) in fieldAttr.options" class="flex items-center gap-2">
                <RadioButton :inputId="option.value" :value="option.value" />
                <label :for="option.value">{{ option.label }}</label>
            </div>
        </RadioButtonGroup>

        <!--多选-->
        <CheckboxGroup v-if="fieldType === FormEnum.CHECKBOX" v-model="formData[field]" :name="field"
            class="flex flex-wrap gap-4" v-bind="fieldAttr">
            <div v-if="fieldAttr.options" v-for="(option, o) in fieldAttr.options" class="flex items-center gap-2">
                <Checkbox :inputId="option.value" :value="option.value" />
                <label :for="option.value">{{ option.label }}</label>
            </div>
        </CheckboxGroup>

        <!--切换按钮-->
        <div v-if="fieldType === FormEnum.TOGGLE_BUTTON" class="flex flex-wrap gap-4">
            <ToggleSwitch :name="field" v-model="formData[field]" v-bind="fieldAttr" />
            <label :for="field" style="margin-top: 3px;">
                {{ fieldAttr.placeholder }}
            </label>
        </div>

        <!--下拉单选-->
        <Select v-if="fieldType === FormEnum.SELECT" v-model="formData[field]" :name="field"
            :options="fieldAttr.options" option-label="label" option-value="value" v-bind="fieldAttr" />

        <!--下拉多选-->
        <MultiSelect v-if="fieldType === FormEnum.MULTI_SELECT" v-model="formData[field]" :name="field"
            :options="fieldAttr.options" option-label="label" option-value="value" filter :maxSelectedLabels="3"
            v-bind="fieldAttr" />

        <!--树形单选-->
        <TreeSelect v-if="fieldType === FormEnum.TREE_SELECT" v-model="formData[field]" :name="field"
            selection-mode="single" :options="fieldAttr.options" class="w-full" v-bind="fieldAttr" />

        <!--触发规则信息-->
        <Message v-if="invalid" severity="error" size="small" variant="simple" class="mt-1 mf-1">
            {{ message }}
        </Message>
    </div>
</template>