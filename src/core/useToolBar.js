import { ref, provide } from 'vue'
import { useMessage } from './useMessage'

export function useToolBar() {
    const message = useMessage()
    const keyRef = ref(null)
    const items = ref([])
    const modeEnum = {
        SINGLE: 'single',
        MULTIPLE: 'multiple'
    }
    const registerKey = (keyObj) => keyRef.value = keyObj
    const register = (label, callback) => {
        let id = `action_${Date.now()}_${items.value.length}`
        let perKey = keyRef.value.get(id)
        let item = {
            id,
            perKey,
            ignorePer: false,
            mode: '',
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
        const enablePer = (id) => {
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
        const enableMultiple = () => {
            item.mode = modeEnum.MULTIPLE
            return api
        }
        const enableSingle = () => {
            item.mode = modeEnum.SINGLE
            return api
        }

        const api = { enablePer, enableMultiple, enableSingle, ignorePer, setAttr, on }

        if (typeof callback === 'function') {
            callback(api)
            return api
        }

        items.value.push(item)
        return api
    }

    const validSelect = (items, mode) => {
        if (mode !== modeEnum.MULTIPLE && mode !== modeEnum.SINGLE) return true

        if (!items || (Array.isArray(items) && items.length === 0)
            || (!Array.isArray(items) && typeof items === 'object' && Object.keys(items).length === 0)) {
            message.warning('请选择一项操作')
            return false
        }

        if (mode === modeEnum.SINGLE && items.length > 1) {
            message.warning('只能选择一项操作')
            return false
        }

        return true
    }

    provide('toolBar', { items, validSelect })
    return { register, registerKey }
}