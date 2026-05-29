import { ref, provide } from 'vue'

export function useToolBar() {
    const keyRef = ref(null)
    const items = ref([])
    const registerKey = (keyObj) => keyRef.value = keyObj
    const register = (label, callback) => {
        let id = `action_${Date.now()}_${items.value.length}`
        let perKey = keyRef.value.get(id)
        let item = {
            id,
            perKey,
            ignorePer: false,
            _command: () => { },
            props: {
                label,
                icon: '',
                severity: 'primary',
                variant: 'outlined',
                loading: false
            }
        }

        const on = (func) => {
            item._command = func
            return api
        }
        const enabledPer = (id) => {
            item.perKey = keyRef.value.get(id)
            return api
        }
        const ignorePer = () => {
            item.ignorePer = true
            return api
        }
        const setAttr = (attrs = {}) => {
            if (typeof attrs !== 'object') return this
            // 兼容下传入type时的情况
            if (attrs.type) attrs.severity = attrs.type
            item.props = { ...item.props, ...attrs }
            return api
        }

        const api = { enabledPer, ignorePer, setAttr, on }

        if (typeof callback === 'function') {
            callback(api)
            return api
        }

        items.value.push(item)
        return api
    }

    provide('toolBar', { items })
    return { register, registerKey }
}