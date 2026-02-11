<script setup>
// import { reactive, ref, computed } from 'vue'
// import { FormEnum } from '../enum/FormEnum'

// // 只接收一个表单数据对象
// const props = defineProps({
//     configs: {
//         type: Array,
//         default: () => []
//     },
// })

// // 配置和初始数据
// const formData = reactive(props.data ?? {})

// // 动态生成 rules
// const rules = computed(() => {
//     const r = {}
//     props.config.flat().forEach((item) => {
//         // 根据 hideFunc 判断字段是否显示，隐藏则不必填
//         const visible = item.hideFunc ? item.hideFunc(formData) : true
//         if (item.fieldAttr.require && visible) {
//             r[item.field] = [{
//                 required: true,
//                 message: `${item.fieldAttr.label}为必填项`,
//                 trigger: 'blur'
//             }]
//         }
//     })
//     return r
// })

// // 表单组件事件
// const onEvent = (e, item) => {
//     item.command(e, item, formData)
// }

// const getAutoSpan = (row, index) => {
//     const count = row.filter(a => a.hideFunc(formData)).length
//     const TOTAL = 24

//     const base = Math.floor(TOTAL / count)
//     const remain = TOTAL % count

//     // 前 remain 个每个 +1
//     return base + (index < remain ? 1 : 0)
// }

// // form ref
// const formRef = ref(null)
// // 暴露componentRef
// defineExpose({
//     formRef,
//     formData,
//     valid: () => new Promise((resolve, reject) => {
//         formRef.value?.validate((valid, fields) => {
//             if (valid) resolve(true)
//             else reject(fields)
//         })
//     }),
//     reset: () => formRef.value?.resetFields()
// })

</script>

<template>
    <!-- <div>
        <el-row v-for="configItems in configs">
            <el-col v-for="(item, c) in configItems" :key="c" :span="getAutoSpan(item, c)">

            </el-col>
        </el-row>
    </div> -->
</template>