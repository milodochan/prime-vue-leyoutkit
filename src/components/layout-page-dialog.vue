<script setup>
import { computed, inject, ref, toRaw, watch } from 'vue'
import { useDialogAttrs } from '../core/useAttrs'

const propsData = ref({})
const componentRef = ref(null)
const dialogAttrs = useDialogAttrs()
const dialogKey = ref(`${Date.now()}-${Math.random()}`)

const props = defineProps({
    propsData: Object,
    dialog: {
        type: Object,
        default: () => []
    }
})

const dialogInstanceRef = ref(null)
const instance = ref(null)
const data = ref(null)

watch(
    () => props.dialog.instance,
    (ins) => {
        if (!ins) return
        instance.value = ins
        data.value = ins.get()   // 👈 锁定本次 dialog 的 data
        if (dialogInstanceRef.value.maximized)
            dialogInstanceRef.value.maximized = false
    },
    { immediate: true }
)

// const instance = computed(() => props.dialog.instance)
// const data = computed(() => instance.value?.get())
const emits = defineEmits(['update:visible'])
const visible = computed({
    get: () => data.value?.visible ?? false,
    set: (val) => {
        data.value.visible = val
        emits('update:visible', val)
    }
})

const attrs = computed(() => {
    const base = { ...dialogAttrs }
    const ext = data.value?.attrs || {}

    Object.keys(base).forEach(k => {
        if (k in ext) base[k] = ext[k]
    })

    return base
})


// 提供默认空 Map，防止 inject 失败
const dialogSlotMap = inject('dialogSlotMap', ref(new Map()))

// 当前内容组件
const currentComponent = computed(() => {
    const comp = data.value?.component
    if (!comp) return null

    if (typeof comp === 'string') {
        return dialogSlotMap.value.get(comp) || null
    }

    // 真实组件对象 或者 defineAsyncComponent
    if (typeof comp === 'object' || typeof comp === 'function') {
        return comp
    }

    return null
})

const destroy = () => {
    propsData.value = {}
    instance.value?.destroy()
}

const actionCommands = async (item) => {
    if (!item || typeof item.command !== 'function') return

    item.loading = true  // 打开按钮 loading

    try {
        const result = item.command(instance.value, componentRef.value)  // 执行函数, 此处考虑可以获取组件的参数
        // 如果返回 Promise，等待完成
        if (result instanceof Promise) {
            await result
        }
    } catch (e) {
        console.error('事件执行失败:', e)
    } finally {
        item.loading = false // 关闭按钮 loading
    }
}

const loadData = async () => {
    try {
        if (event?.state) {
            event.state.maximized = false
        }

        const result = typeof data.value.propsData === "function"
            ? await data.value.propsData()
            : data.value.propsData

        propsData.value = result && typeof result === "object"
            ? { ...toRaw(result) }
            : {}

        if (data.value?.component === 'form' && data.value?.formData) {
            const formData = typeof data.value?.formData === "function"
                ? await data.value.formData()
                : structuredClone(toRaw(data.value.formData))

            propsData.value = {
                ...data.value.propsData,
                data: toRaw(formData)
            }
        }

    } catch (err) {
        console.error("propsData 加载失败:", err)
        propsData.value = {}
    } finally {
        data.value.loading = false
        dialogKey.value = `${Date.now()}-${Math.random()}`
    }
}
</script>

<template>
    <div>
        <Dialog v-model:visible="visible" ref="dialogInstanceRef" @after-hide="destroy()" @show="loadData"
            v-bind="attrs">
            <div v-if="data.loading" class="flex justify-center items-center" style="min-height: 150px;">
                <ProgressSpinner />
            </div>
            <template v-else>
                <component :key="dialogKey" ref="componentRef" v-if="currentComponent" :is="currentComponent"
                    v-bind="propsData" />

                <div v-else class="text-gray-400 text-sm text-center p-4">
                    ⚠️ 无内容可展示，请检查 component 是否传入正确。
                </div>
            </template>
            <template #footer>
                <template v-for="(item, i) in data?.actions ?? []" :key="i">
                    <Button type="button" :severity="item.type" :icon="item.icon" :loading="item.loading"
                        :label="item.label" @click="actionCommands(item)" />
                </template>
            </template>
        </Dialog>
    </div>
</template>