import { markRaw, ref } from 'vue'
import { dialogStore } from '../store'

export function useDialog() {
    const _dialogs = dialogStore.list

    return {
        register(title) {
            const actions = ref([])
            const props = ref({
                header: '',
                visible: false,
                maximizable: false,
                draggable: true,
                modal: true,
                style: { width: '65rem' }
            })

            const attributes = ref({
                id: '',
                loading: true,
                disabledCancelButton: false,
                disabledCancelButtonIcon: false,
                component: null,
                propsData: {},
                formData: null
            })

            const disabledCancel = () => {
                attributes.value.disabledCancelButton = true
                return method
            }

            const disabledCancelIcon = () => {
                attributes.value.disabledCancelButtonIcon = true
                return method
            }
            const enabledMaximizable = () => {
                props.value.maximizable = true
                return method
            }
            const setTitle = (title) => {
                props.value.header = title
                return method
            }
            const setAttr = (attrs = {}) => {
                if (typeof attrs !== 'object') return data
                props.value = { ...props.value, ...attrs }
                return method
            }
            const setWidth = (width) => {
                props.value.style = { ...props.value.style, width }
                return method
            }
            const setStyle = (style) => {
                props.value.style = { ...props.value.style, ...style }
                return method
            }
            const setContentStyle = (style) => {
                props.value.contentStyle = { ...props.value, ...style }
                return method
            }
            const setBtn = (callback) => {
                const btn = {
                    label: '',
                    icon: '',
                    type: '',
                    loading: false,
                    command: () => { }
                }

                const btnApi = {
                    setLabel(l) {
                        btn.label = l
                        return btnApi
                    },
                    setIcon(i) {
                        btn.icon = i
                        return btnApi
                    },
                    setType(t) {
                        btn.type = t
                        return btnApi
                    },
                    on(fn) {
                        btn.command = fn
                        return btnApi
                    }
                }

                if (typeof callback === 'function') {
                    callback(btnApi)
                    actions.value.push(btn)
                }
                return method
            }
            const setComponent = (comp, propsData) => {
                if (comp) {
                    attributes.value.component = markRaw(comp)
                }

                if (!propsData) return method
                attributes.value.propsData = propsData
                return method
            }
            const setForm = (propsData) => setComponent('form', propsData)
            const setFormData = (propsData) => {
                attributes.value.formData = propsData
                return method
            }

            const get = () => ({ attributes, props, actions })
            const show = () => {
                attributes.value.id = `action_${Date.now()}_${_dialogs.length}`
                props.value.visible = true
                attributes.value.loading = true
                _dialogs.push({
                    get, destroy, hide
                })
            }
            const hide = () => props.value.visible = false
            const destroy = () => {
                const index = _dialogs.findIndex(d => d.get().attributes.value.id === attributes.value.id)
                if (index !== -1) _dialogs.splice(index, 1)
            }

            const method = {
                show,
                hide,
                destroy,
                setTitle,
                setAttr,
                setWidth,
                setStyle,
                setBtn,
                setComponent,
                setForm,
                setFormData,
                setContentStyle,
                disabledCancel,
                disabledCancelIcon,
                enabledMaximizable
            }

            attributes.value.id = `${Date.now()}-${Math.random()}`
            props.value.header = title
            return method
        }
    }
}