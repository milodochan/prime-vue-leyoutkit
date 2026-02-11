import { reactive, readonly, ref } from 'vue'

export function useToolBar(keyMap) {
    const _toolbar_actions = ref([])
    const toolbar = reactive({
        actions: readonly(_toolbar_actions.value),
        register: (label, callback) => {
            let id = `action_${Date.now()}_${_toolbar_actions.value.length}`
            let perKey = keyMap.get(id)
            const obj = { id, perKey, label, icon: '', type: 'primary', _command: () => { } }
            _toolbar_actions.value.push(obj)

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
        get(id) {
            const action = _toolbar_actions.value.find(a => a.id === id)
            if (!action) {
                console.warn(`未找到 toolbar 动作 id = '${id}'`)
                return {
                    on: () => { } // 空方法防止报错
                }
            }
            return {
                ...action,
                on(fn) {
                    action._command = fn
                    return this
                }
            }
        }
    })

    return toolbar
}