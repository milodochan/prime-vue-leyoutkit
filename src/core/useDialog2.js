import { reactive, readonly, markRaw, ref, inject, provide, toRaw } from 'vue'

export function useDialog() {
    const _dialogs = ref([])
    const dialog = reactive({
        instance: null,
        dialogs: readonly(_dialogs.value),
        /**
         * 注册 dialogSlotMap
         * registerProvide('key', comp)
         */
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

            // 永远 markRaw，避免组件被 reactive 包装
            slotMapRef.value.set(id, markRaw(comp))

            return this
        },
        register(title) {
            const id = `${Date.now()}-${Math.random()}`

            // 通过 reactive 创建真正的实例
            const obj = reactive({
                id,
                visible: false,
                loading: false,
                attrs: {
                    title: title || '',
                    alignCenter: false,
                    fullscreen: false,
                    draggable: false,
                    withCancel: true,
                    width: '50%',
                    center: false
                },
                component: null,
                propsData: {},
                _actions: [], // 内部存储真实动作对象
                // --- 动作 getter 自动添加取消按钮 ---
                get actions() {
                    if (!this.attrs.withCancel) return this._actions
                    return [
                        ...this._actions,
                        {
                            label: '取消',
                            icon: '',
                            type: 'default',
                            loading: false,
                            command: () => { this.visible = false }
                        }
                    ]
                },
                // --- 链式 API ---
                setTitle(title) {
                    obj.attrs.title = title
                    return obj
                },
                setAttr(attrs = {}) {
                    if (typeof attrs !== 'object') return this
                    Object.assign(obj.attrs, attrs)
                    return this
                },
                setBtn(label = '', command = () => { }, type = 'info', icon = '') {
                    const index = this._actions.findIndex(a => a.label === label)
                    if (index !== -1) {
                        this._actions[index] = { label, icon, type, loading: false, command }
                    } else {
                        this._actions.push({ label, icon, type, loading: false, command })
                    }
                    return this
                },
                setComponent(comp, propsData) {
                    if (comp) {
                        obj.component = markRaw(comp)
                    }

                    // 没有 propsData，直接结束
                    if (!propsData) return obj

                    // ---- 加载 propsData ----
                    const loadProps = async () => {
                        obj.loading = true
                        try {
                            let resolved
                            if (typeof propsData === 'function') {
                                resolved = propsData()
                                if (resolved instanceof Promise) {
                                    resolved = await resolved
                                }
                            } else if (typeof propsData === 'object') {
                                resolved = propsData
                            }
                            // 浅拷贝为普通对象，避免 Proxy
                            obj.propsData = resolved && typeof resolved === 'object'
                                ? { ...toRaw(resolved) }
                                : {}
                        } catch (e) {
                            console.error('propsData 加载失败:', e)
                            obj.propsData = {}
                        } finally {
                            obj.loading = false
                        }
                    }

                    // 异步加载（不阻塞链式调用）
                    loadProps()

                    return obj
                },
                setForm(propsData) { return obj.setComponent('form', propsData) },
                show() {
                    obj.visible = true
                    dialog.instance = obj
                },
                hide() {
                    obj.visible = false
                },
                destroy() {
                    if (!dialog.instance) return

                    // 关闭时重置数据
                    const instance = dialog.instance
                    if (instance.data) {
                        // 这里统一重置表单数据
                        if (typeof instance.data === 'object') {
                            Object.keys(instance.data).forEach(k => instance.data[k] = undefined)
                        }
                    }

                    // 关闭弹窗
                    instance.visible = false
                    instance.loading = false
                }
            })

            _dialogs.value.push(obj)
            return obj
        }
    })

    return dialog
}
