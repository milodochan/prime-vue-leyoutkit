import { provide, ref } from 'vue'

export function useTableBar() {
    const keyRef = ref(null)
    const items = ref([])
    const props = ref({
        header: '工具栏',
        style: { width: 'auto' },
        align: 'center'
    })
    const setAttr = (attrs = {}) => props.value = { ...props.value, ...attrs }
    const setTitle = (title) => props.value.header = title
    const setWidth = (width) => props.value.style = { ...props.value.style, width }
    const setStyle = (style) => props.value.style = { ...props.value.style, ...style }
    const enabledForzen = () => setAttr({ frozen: true })
    const registerKey = (keyObj) => keyRef.value = keyObj
    const register = (label, callback) => {
        let id = `action_${Date.now()}_${items.value.length}`
        let perKey = keyRef.value.get(id)
        let item = {
            id,
            perKey,
            _command: () => { },
            _hideFunc: () => true,
            props: {
                label,
                icon: '',
                severity: 'primary',
                variant: 'text'
            }
        }

        const on = (func) => {
            item._command = func
            return api
        }
        const hide = (func) => {
            item._hideFunc = func
            return api
        }
        const enabledPer = (id) => {
            item.perKey = keyRef.value.get(id)
            return api
        }
        const setAttr = (attrs = {}) => {
            if (typeof attrs !== 'object') return this
            // 兼容下传入type时的情况
            if (attrs.type) attrs.severity = attrs.type
            item.props = { ...item.props, ...attrs }
            return api
        }

        const api = { enabledPer, setAttr, hide, on }

        if (typeof callback === 'function') {
            callback(api)
            return api
        }

        items.value.push(item)
        return api
    }

    provide('tableBar', { props, items })
    return {
        register, setAttr, setTitle, setWidth,
        setStyle, enabledForzen, registerKey
    }
}