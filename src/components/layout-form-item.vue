<script setup>
import { computed } from 'vue'
import { FormEnum } from '../enum/FormEnum'
import { formSlotStore } from '../store'

const emit = defineEmits(['update'])
const props = defineProps({
    invalid: Boolean,
    message: String,
    item: Object,
    data: Object
})

const formData = props.data
const field = props.item?.field
const fieldType = props.item?.fieldType
const disableLabel = props.item?.disableLabel || false
const model = computed({
    get() {
        let val = formData[field]
        if (fieldType === FormEnum.TREE_SELECT) {
            if (Array.isArray(val)) {
                return val.reduce((acc, key) => {
                    if (key) acc[key] = true
                    return acc
                }, {})
            }
            else return val ? { [val]: true } : {}
        }

        if (fieldType === FormEnum.DATE_PICKER) {
            if (val && val.includes('T')) {
                if (props.item.props.showTime) val = val.split('T')
                else val = val.split('T')[0]
            }
        }

        return val
    },
    set(val) {
        if (fieldType === FormEnum.TREE_SELECT) {
            if (typeof val === 'object') {
                const keys = Object.keys(val)
                formData[field] = keys.length > 1 ? keys : keys[0]
                return
            }
        }
        formData[field] = val
    }
})
// 占时不用了
// const formatDateTime = (date, showTime = true) => {
//     if (!date) return null

//     const d = date instanceof Date ? date : new Date(date)

//     const y = d.getFullYear()
//     const m = String(d.getMonth() + 1).padStart(2, '0')
//     const day = String(d.getDate()).padStart(2, '0')

//     let timeSuffix = '00:00:00'
//     if (showTime) {
//         const hh = String(d.getHours()).padStart(2, '0')
//         const mm = String(d.getMinutes()).padStart(2, '0')
//         const ss = String(d.getSeconds()).padStart(2, '0')
//         timeSuffix = `${hh}:${mm}:${ss}`
//     }

//     return `${y}-${m}-${day} ${timeSuffix}`
// }
// 组件props
const fieldProps = computed(() => {
    const item = props.item
    const base = item?.props || {}

    let extra = {}
    if (item.attrFunc) {
        extra = item.attrFunc(formData, base) || {}
    }

    // ❗返回新对象，不污染原数据
    return {
        ...base,
        ...extra
    }
})
// 当前内容组件是否插槽
const isSlot = computed(() => {
    const comp = props.item.component
    return typeof comp === 'string' && formSlotStore.value?.has(comp)
})
// 当前内容组件
const component = computed(() => {
    const comp = props.item.component
    if (!comp) return null

    // 真实组件对象 或者 defineAsyncComponent
    if (typeof comp === 'object' || typeof comp === 'function') {
        return comp
    }

    // 是字符串 key，尝试从 formSlotStore 查找组件
    if (typeof comp === 'string' && formSlotStore.value?.has(comp)) {
        return formSlotStore.value.get(comp)
    }

    return null
})
// 表单组件事件
const onEvent = (event) => props.item.command(formData[field], props.item, formData, event)
// 组件更新
const update = (val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.keys(val).forEach(key => {
            formData[key] = val[key]
            emit('update', { field: key, value: val[key] })
        })
    } else {
        formData[field] = val
        emit('update', { field: field, value: val })
    }
    props.item.command(val, props.item, formData)
}
</script>

<template>
    <!--此组件未完成，还需封装一下-->
    <div class="flex flex-col gap-1">
        <label :for="field" v-if="!disableLabel">{{ fieldProps.label }}</label>
        <FormField v-if="fieldType === FormEnum.COMPONENT" as="section" v-slot="$field" :name="fieldProps.name"
            :initialValue="model">
            <component v-if="component" :is="component" @update="(val) => update(val)"
                v-bind="isSlot ? { data: formData, props: fieldProps } : formData" />
        </FormField>
        <!--数字输入框-->
        <InputNumber v-if="fieldType === FormEnum.INPUT_NUMBER" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--文本输入框-->
        <InputText v-if="fieldType === FormEnum.INPUT_TEXT" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--密码框-->
        <Password v-if="fieldType === FormEnum.PASSWORD" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--富文本-->
        <Textarea v-if="fieldType === FormEnum.INPUT_TEXTAREA" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--日历-->
        <DatePicker v-if="fieldType === FormEnum.DATE_PICKER" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--单选-->
        <RadioButtonGroup v-if="fieldType === FormEnum.RADIO_BUTTON" v-model="model" class="flex flex-wrap gap-4"
            v-bind="fieldProps">
            <div v-for="(option, o) in fieldProps?.options" :key="o" class="flex items-center gap-2">
                <RadioButton :inputId="field + String(option.value)" :value="option.value" @click="onEvent"
                    :id="field + String(option.value)" />
                <label :for="field + String(option.value)">{{ option.label }}</label>
            </div>
        </RadioButtonGroup>
        <!--多选-->
        <CheckboxGroup v-if="fieldType === FormEnum.CHECKBOX" v-model="model" class="flex flex-wrap gap-4"
            v-bind="fieldProps">
            <div v-for="(option, o) in fieldProps?.options" :key="o" class="flex items-center gap-2">
                <Checkbox :inputId="field + String(option.value)" :value="option.value" @click="onEvent"
                    :id="field + String(option.value)" />
                <label :for="field + String(option.value)">{{ option.label }}</label>
            </div>
        </CheckboxGroup>
        <!--切换按钮-->
        <div v-if="fieldType === FormEnum.TOGGLE_BUTTON" class="flex flex-wrap gap-4">
            <ToggleSwitch v-model="model" v-bind="fieldProps" @click="onEvent" :id="field" />
            <label :for="field" style="margin-top: 3px;">
                {{ fieldProps.placeholder }}
            </label>
        </div>
        <!--下拉单选-->
        <Select v-if="fieldType === FormEnum.SELECT" v-model="model" v-bind="fieldProps" @change="onEvent"
            :id="field" />
        <!--下拉多选-->
        <MultiSelect v-if="fieldType === FormEnum.MULTI_SELECT" v-model="model" v-bind="fieldProps" @click="onEvent"
            :id="field" />
        <!--树形单选-->
        <TreeSelect v-if="fieldType === FormEnum.TREE_SELECT" v-model="model" v-bind="fieldProps" @change="onEvent"
            :id="field" />
        <!--触发规则信息-->
        <Message v-if="invalid" severity="error" size="small" variant="simple" class="mt-1 mf-1">
            {{ message }}
        </Message>
    </div>
</template>