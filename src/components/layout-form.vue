<script setup>
import LayoutFormItem from './layout-form-item.vue'
import { ref, computed } from 'vue'
import { FormEnum } from '../enum/FormEnum'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'

// 只接收一个表单数据对象
const props = defineProps({
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
// 配置和初始数据
const formData = props.data
// localConfig
const localConfig = computed(() => props.config ?? [])
// 动态生成 rules
const resolver1 = computed(() => {
    const r = {}
    localConfig.value?.flat()?.forEach((item) => {
        // 根据 hideFunc 判断字段是否显示，隐藏则不必填
        const visible = item.hideFunc ? item.hideFunc(formData) : true
        // 每个字段的验证规则数组
        let schema  // 规则参考地址：https://zod.dev/api
        if (item.require && visible) {
            switch (item.fieldType) {
                case FormEnum.INPUT_TEXT:
                case FormEnum.INPUT_TEXTAREA:
                    schema = z.string({
                        required_error: `${item.props.label}为必填项`,
                        invalid_type_error: `${item.props.label}为必填项`
                    }).min(1, { message: `${item.props.label}为必填项` })
                    break
                case FormEnum.DATE_PICKER:
                    schema = z
                        .union([z.string(), z.date()])
                        .refine(val => {
                            if (!val) return false
                            if (val instanceof Date) return !Number.isNaN(val.getTime())
                            if (typeof val === 'string') return val.trim() !== ''
                            return false
                        }, {
                            message: `${item.props.label}为必填项`
                        })
                    break
                case FormEnum.INPUT_NUMBER:
                    schema = z.number({
                        required_error: `${item.props.label}为必填项`,
                        invalid_type_error: `${item.props.label}为必填项`
                    }).refine(val => val !== null && val !== '', { message: `${item.props.label}为必填项` })
                    break
                case FormEnum.RADIO_BUTTON:
                case FormEnum.SELECT:
                    schema = z.union([z.string(), z.number()]).refine(val => val !== null && val !== '', {
                        message: `${item.props.label}为必填项`
                    })
                    break
                case FormEnum.TREE_SELECT:
                    schema = z.any().refine(obj => {
                        if (!obj) return false
                        return Object.keys(obj).length > 0
                    }, {
                        message: `${item.props.label}为必填项`
                    })
                    break
                case FormEnum.CHECKBOX:
                case FormEnum.MULTI_SELECT:
                    schema = z.array(z.union([z.string(), z.number()])).min(1, { message: `${item.props.label}为必填项` })
                    break
                case FormEnum.TOGGLE_BUTTON:
                    schema = z.boolean()
                    break
                default:
                    schema = z.any().refine(val => {
                        if (val === null || val === undefined) return false
                        if (typeof val === 'string') return val.trim() !== ''
                        if (Array.isArray(val)) return val.length > 0
                        if (typeof val === 'object') return Object.keys(val).length > 0
                        return true
                    }, {
                        message: `${item.props.label}为必填项`
                    })
            }

            if (item.rules) {
                const newSchema = item.rules(schema)
                if (newSchema) schema = newSchema
            }
            r[item.field] = schema
        }
    })
    return zodResolver(z.object(r))
})

//------------------------------------
const required = (schema, item) => {
    return z.any().superRefine((val, ctx) => {
        let require = val === null || val === undefined // 必填统一校验
        if (!require) require = typeof val === 'string' && val.trim() === ''    // 字符串
        if (!require) require = Array.isArray(val) && val.length === 0  // 数组
        if (!require) require = typeof val === 'object' && !(val instanceof Date) && Object.keys(val).length === 0  // 对象（排除 Date）

        if (require) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${item.props.label}为必填项`
            })

            return
        }

        // 执行真正 schema 校验
        const result = schema.safeParse(val)
        if (!result.success) {
            result.error.issues.forEach(issue => {
                ctx.addIssue(issue)
            })
        }
    })
}

const resolver = computed(() => {
    const r = {}
    localConfig.value?.flat()?.forEach((item) => {
        if (!item.require) return
        const hidden = item.hideFunc ? item.hideFunc(formData) : true
        if (!hidden) return

        let schema
        switch (item.fieldType) {
            // 输入框
            case FormEnum.INPUT_TEXT:
            case FormEnum.INPUT_TEXTAREA:
            case FormEnum.PASSWORD:
                schema = z.string()
                break
            // 日期
            case FormEnum.DATE_PICKER:
                // schema = z.union([z.string(), z.date()])
                schema = z
                    .union([z.string(), z.date()])
                    .refine(val => {
                        if (!val) return false
                        if (val instanceof Date) return !Number.isNaN(val.getTime())
                        if (typeof val === 'string') return val.trim() !== ''
                        return false
                    }, {
                        message: `${item.props.label}为必填项`
                    })
                break
            // 数字
            case FormEnum.INPUT_NUMBER:
                schema = z.number()
                break
            // 单选
            case FormEnum.RADIO_BUTTON:
            case FormEnum.SELECT:
                schema = z.union([z.string(), z.number()])
                break
            // 树
            case FormEnum.TREE_SELECT:
                schema = z.any()
                break
            // 多选
            case FormEnum.CHECKBOX:
            case FormEnum.MULTI_SELECT:
                schema = z.array(
                    z.union([
                        z.string(),
                        z.number()
                    ])
                )
                break
            // 开关
            case FormEnum.TOGGLE_BUTTON:
                schema = z.boolean()
                break
            default:
                schema = z.any()
        }

        // 必填统一处理
        schema = required(schema, item)

        // 自定义规则
        if (item.rules) {
            const newSchema = item.rules(schema, z, formData)
            if (newSchema) {
                schema = newSchema
            }
        }

        r[item.field] = schema
    })

    return zodResolver(z.object(r))
})

//------------------------------------

const updateField = (item) => {
    formRef.value.setFieldValue(item.field, item.value)
}

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
                            :invalid="item.require && $form[item.field]?.invalid"
                            :message="$form[item.field]?.error?.message" :style="`width: ${100 / row.length}%`"
                            @update="updateField" />
                    </template>
                </div>
            </Fluid>
        </Form>
    </div>
</template>