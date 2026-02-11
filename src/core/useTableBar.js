import { reactive, readonly, ref } from 'vue'

export function useTableBar(keyMap) {
    // 列表工具栏
    const _tablebar_actions = ref([])
    const tablebar = reactive({
        title: '工具栏',
        width: 'auto',
        align: 'center',
        position: 'right',// 另外一个 left
        actions: readonly(_tablebar_actions.value),
        style: {},
        register: (label, callback) => {
            let id = `action_${Date.now()}_${_tablebar_actions.value.length}`
            let perKey = keyMap.get(id)
            const obj = { id, perKey, label, icon: '', type: 'primary', _command: () => { }, _hideFunc: () => true }
            _tablebar_actions.value.push(obj)

            const api = {
                enabledPer(id) {
                    obj.id = id
                    obj.perKey = keyMap.get(id)
                    return api
                },
                setAttr(attrs = {}) {
                    if ('icon' in attrs) obj.icon = attrs.icon
                    if ('type' in attrs) obj.type = attrs.type
                    return api
                },
                hide(fn) { obj._hideFunc = fn; return api },
                on(fn) { obj._command = fn; return api }
            }

            if (typeof callback === 'function') {
                callback(api)
                return api
            }

            return {
                ...obj,
                ...api
            }
        },
        setAttr(attrs = {}) {
            if ('title' in attrs) obj.title = attrs.title
            if ('width' in attrs) obj.width = attrs.width
            if ('align' in attrs) obj.align = attrs.align
            if ('position' in attrs) obj.position = attrs.position
            return api
        },
        setTitle: (title) => { tablebar.title = title },
        setWidth: (width) => { tablebar.width = width },
        setAlign: (align) => { tablebar.align = align },
        setPosition: (position) => { tablebar.position = position },
        get(id) {
            id = keyMap.get(id)
            const action = _tablebar_actions.value.find(a => a.id === id)
            if (!action) {
                console.warn(`未找到 tablebar 动作 id = '${id}'`)
                return {
                    on: () => { } // 空方法防止报错
                }
            }
            return {
                ...action,
                hide(fn) { action._hideFunc = fn; return this },
                on(fn) {
                    action._command = fn
                    return this
                }
            }
        }
    })

    return tablebar
}