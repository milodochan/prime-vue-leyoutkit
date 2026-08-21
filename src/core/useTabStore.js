import { ref, readonly } from 'vue'

const tabs = ref([])
const activePath = ref('/')
const onTabRemove = ref(() => { })

const add = (tab) => {
    activePath.value = tab.path
    if (tab.path !== '/' && !tabs.value.some(t => t.path === tab.path)) {
        tabs.value.push(tab)
    }
}

const remove = (path) => {
    // 先处理 iframeTabs 删除（如果钩子存在）
    if (onTabRemove.value && typeof onTabRemove.value === 'function')
        onTabRemove.value(path)

    tabs.value = tabs.value.filter(t => t.path !== path)
    if (tabs.value.length > 0) {
        if (activePath.value === path) {
            activePath.value = tabs.value.at(-1)?.path
            return
        }
    }

    activePath.value = '/'
}

const registerRemoveHook = (func) => onTabRemove.value = func
const change = (path) => activePath.value = path
const setActivePath = (path) => activePath.value = path
const removeOther = () => tabs.value = tabs.value.filter(t => t.path === activePath.value)
const removeAll = () => {
    tabs.value = []
    activePath.value = '/'
}

export const useTabStore = () => ({
    tabs: readonly(tabs),
    activePath: readonly(activePath),  // 外部只读
    add,
    change,
    remove,
    removeOther,
    removeAll,
    registerRemoveHook
})