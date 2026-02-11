import { reactive, markRaw, ref, inject, provide } from 'vue'

export function useDialog() {
    const _dialogs = ref([])
    const dialog = reactive({
        instance: null,
        registerProvide(id, comp) {
            if (typeof id !== 'string') {
                console.warn(`[dialog] registerProvide: key 必须为 string，收到:`, id)
                return this
            }

            // 获取已有 map（若无则创建）
            let slotMapRef = inject('dialogSlotMap', null)
            if (!slotMapRef) {
                slotMapRef = ref(new Map())
                provide('dialogSlotMap', slotMapRef)
            }

            slotMapRef.value.set(id, markRaw(comp))
            return this
        },
        register(title) {
            const id = `${Date.now()}-${Math.random()}`
            const data = reactive({
                id,
                visible: false,
                loading: false,
                attrs: {
                    header: title || '',
                    draggable: true,
                    modal: true,
                    maximizable: true,
                    style: { width: '65rem' }
                },
                component: null,
                propsData: {},
                formData: null,
                withCancel: true,
                _actions: [],
                get actions() {
                    if (!this.withCancel) return this._actions
                    return [
                        ...this._actions,
                        {
                            label: '取消',
                            icon: '',
                            type: 'secondary',
                            loading: false,
                            command: () => { this.visible = false }
                        }
                    ]
                }
            })

            const get = () => data
            const disabledCancel = () => {
                data.withCancel = false
                return method
            }
            const setTitle = (title) => {
                data.attrs.header = title
                return method
            }
            const setAttr = (attrs = {}) => {
                if (typeof attrs !== 'object') return this
                Object.assign(data.attrs, attrs)
                return method
            }
            const setBtn = (label = '', command = () => { }, type = 'info', icon = '') => {
                const index = data._actions.findIndex(a => a.label === label)
                if (index > -1) {
                    data._actions[index] = { label, icon, type, loading: false, command }
                } else {
                    data._actions.push({ label, icon, type, loading: false, command })
                }
                return method
            }
            const setComponent = (comp, propsData) => {
                if (comp) {
                    data.component = markRaw(comp)
                }

                if (!propsData) return method
                data.propsData = propsData
                return method
            }
            const setForm = (propsData) => setComponent('form', propsData)
            const setFormData = (propsData) => {
                data.formData = propsData
                return method
            }
            const show = () => {
                data.visible = true
                data.loading = true
                dialog.instance = {
                    get, destroy, hide
                }
            }
            const hide = () => data.visible = false
            const destroy = () => {
                if (!dialog.instance) return
                // 关闭时重置数据
                if (data.propsData) {
                    if (data.component === 'form') {
                        data.formData = null
                        data.propsData.data = null
                    }
                    else Object.keys(data.propsData).forEach(k => data.propsData[k] = undefined)
                }
                // 关闭弹窗
                data.visible = false
                data.loading = false
            }

            const method = {
                show,
                hide,
                destroy,
                setTitle,
                setAttr,
                setBtn,
                setComponent,
                setForm,
                setFormData,
                disabledCancel
            }
            _dialogs.value.push(data)
            return method
        }
    })

    return dialog
}