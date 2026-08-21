<script setup>
import { computed, ref, toRaw } from 'vue'
import { dialogSlotStore } from '../store'

const emits = defineEmits(['update:visible'])
const props = defineProps({ dialog: Object })

const loading = ref(true)
const propsData = ref({})
const componentRef = ref(null)
const dialogKey = ref(`${Date.now()}-${Math.random()}`)
const dialog = computed(() => props.dialog)
const dialogProps = computed(() => dialog.value.get().props.value)
const dialogAttributes = computed(() => dialog.value.get().attributes.value)
const dialogActions = computed(() => dialog.value.get().actions.value)
const actions = computed(() => {
    if (dialogAttributes.value.disableCancelButton) {
        return dialogActions.value
    }

    return [
        ...dialogActions.value,
        {
            label: '取消',
            icon: dialogAttributes.value.disableCancelButtonIcon ? '' : 'pi pi-times',
            type: 'secondary',
            loading: false,
            command: () => {
                dialogProps.value.visible = false
            }
        }
    ]
})

// 当前内容组件
const currentComponent = computed(() => {
    const comp = dialogAttributes.value.component
    if (!comp) return null

    if (typeof comp === 'string' && dialogSlotStore.value.has(comp)) {
        return dialogSlotStore.value.get(comp) || null
    }

    // 真实组件对象 或者 defineAsyncComponent
    if (typeof comp === 'object' || typeof comp === 'function') {
        return comp
    }

    return null
})

const destroy = () => {
    propsData.value = {}
    dialog.value.destroy()
}

const actionCommands = async (item) => {
    if (!item || typeof item.command !== 'function') return

    item.loading = true  // 打开按钮 loading

    try {
        let dialogRef = { hide: () => dialog.value.hide() }
        const result = item.command(dialogRef, componentRef.value)  // 执行函数, 此处考虑可以获取组件的参数
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
        const result = typeof dialogAttributes.value.propsData === "function"
            ? await dialogAttributes.value.propsData()
            : dialogAttributes.value.propsData

        propsData.value = result && typeof result === "object"
            ? { ...toRaw(result) }
            : {}

        if (dialogAttributes.value.component === 'form' && dialogAttributes.value.formData) {
            const formData = typeof dialogAttributes.value.formData === "function"
                ? await dialogAttributes.value.formData()
                : structuredClone(toRaw(dialogAttributes.value.formData))

            propsData.value = {
                ...dialogAttributes.value.propsData,
                data: toRaw(formData)
            }
        }
    } catch (err) {
        console.error("propsData 加载失败:", err)
        propsData.value = {}
    } finally {
        loading.value = false
        dialogKey.value = `${Date.now()}-${Math.random()}`
    }
}
</script>

<template>
    <div>
        <Dialog v-model:visible="dialogProps.visible" @after-hide="destroy()" @show="loadData" v-bind="dialogProps">
            <div v-if="loading" class="flex justify-center items-center min-h-40">
                <ProgressSpinner fill="transparent" />
            </div>
            <template v-else>
                <component v-if="currentComponent" ref="componentRef" :key="dialogKey" :is="currentComponent"
                    v-bind="propsData" />

                <div v-else class="text-gray-400 text-sm text-center p-4">
                    ⚠️ 无内容可展示，请检查 component 是否传入正确。
                </div>
            </template>
            <template #footer>
                <template v-for="(item, i) in actions" :key="i">
                    <Button type="button" :severity="item.type" :icon="item.icon" :loading="item.loading"
                        :label="item.label" @click="actionCommands(item)" />
                </template>
            </template>
        </Dialog>
    </div>
</template>