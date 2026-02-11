<script setup>
import LayoutFormItem from './layout-form-item.vue'
import { reactive, ref, computed } from 'vue'
import { FormEnum } from '../enum/FormEnum'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

// 只接收一个表单数据对象
const props = defineProps({
    id: {
        type: String,
        default: ''
    },
    data: {
        type: Object,
        default: () => ({})
    },
    config: {
        type: Array,
        default: () => []
    },
})

// form ref
const formRef = ref(null)
// localConfig
const localConfig = reactive(props.config ?? [])
// 配置和初始数据
const formData = reactive(props.data ?? {})
// 动态生成 rules
const resolver = computed(() => {
    const r = {}
    props.config.flat().forEach((item) => {
        // 根据 hideFunc 判断字段是否显示，隐藏则不必填
        const visible = item.hideFunc ? item.hideFunc(formData) : true
        // 每个字段的验证规则数组
        let schema  // 规则参考地址：https://zod.dev/api
        if (item.fieldAttr.require && visible) {
            switch (item.fieldType) {
                case FormEnum.INPUT_TEXT:
                case FormEnum.INPUT_TEXTAREA:
                case FormEnum.DATE_PICKER:
                    schema = z.string().min(1, { message: `${item.fieldAttr.label}为必填项` })
                    break
                case FormEnum.INPUT_NUMBER:
                    schema = z.number().refine(val => val !== null && val !== '', { message: `${item.fieldAttr.label}为必填项` })
                    break
                case FormEnum.RADIO_BUTTON:
                case FormEnum.SELECT:
                case FormEnum.TREE_SELECT:
                    schema = z.union([z.string(), z.number()]).refine(val => val !== null && val !== '', {
                        message: `${item.fieldAttr.label}为必填项`
                    })
                    break
                case FormEnum.CHECKBOX:
                case FormEnum.MULTI_SELECT:
                    schema = z.array(z.union([z.string(), z.number()])).min(1, { message: `${item.fieldAttr.label}为必填项` })
                    break
                case FormEnum.TOGGLE_BUTTON:
                    schema = z.boolean()
                    break
                default:
                    schema = z.any()
            }

            schema = item.rules(schema)
            r[item.field] = schema
        }
    })
    return zodResolver(z.object(r))
})

// 暴露componentRef
defineExpose({
    formRef,
    formData,
    valid: () => new Promise((resolve, reject) => {
        formRef.value.submit()
        formRef.value.validate().then((r) => {
            if (formRef.value.valid) resolve(true)
            else reject(r)
        })
    }),
    reset: () => formRef.value.reset()
})
</script>

<template>
    <div>
        <Form ref="formRef" v-slot="$form" :initialValues="formData" :resolver="resolver">
            <Fluid class="flex flex-col gap-3">
                <div class="flex flex-nowrap gap-3" v-for="(row, r) in localConfig" :key="r">
                    <template v-for="(item, c) in row" :key="item.field" v-show="item.hideFunc(formData)">
                        <LayoutFormItem :item="item" :data="formData"
                            :invalid="item.fieldAttr.require && $form[item.field]?.invalid"
                            :message="$form[item.field]?.error?.message" :style="`width: ${100 / row.length}%`" />
                    </template>
                </div>
            </Fluid>
        </Form>
    </div>
</template>