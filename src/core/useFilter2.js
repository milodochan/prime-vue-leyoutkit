import { reactive, readonly, ref, getCurrentInstance } from 'vue'
import { FilterEnum } from '../enum/FilterEnum'

export function useFilter() {
    const _filter = ref([])
    const instance = getCurrentInstance()
    const globalBuildDataFunc = instance?.appContext.config.globalProperties.$layoutkitBuildDataFunc

    const filter = reactive({
        _overrideBuildFunc: null,
        data: readonly(_filter.value),
        _buildFunc: (items) => {
            if (filter._overrideBuildFunc && typeof filter._overrideBuildFunc === 'function') {
                return filter._overrideBuildFunc(items)
            }

            if (globalBuildDataFunc && typeof globalBuildDataFunc === 'function') {
                return globalBuildDataFunc(items)
            }

            return Object.fromEntries(
                items.map(item => [item.field, item.value])
            )
        },
        register: (field, label = '') => {
            const item = reactive({
                field,
                fieldType: FilterEnum.TEXT,
                fieldAttr: {
                    label: label || field,
                    //placeholder: `请输入${label || field}`,
                    options: [],
                    style: { minwidth: '100px' },
                },
                fieldOperator: '=',
                required: false,
                defaultValue: '',
                value: ''
            })

            const columnApi = {
                setAttr(attrs = {}) {
                    if (typeof attrs !== 'object') return columnApi
                    Object.assign(item.fieldAttr, attrs)
                    return columnApi
                },
                setOptions(options) {
                    item.fieldType = FilterEnum.SELECT
                    item.fieldAttr.options = options
                    return columnApi
                },
                setType(type) {
                    item.fieldType = type
                    return columnApi
                },
                setValue(val) {
                    item.value = val
                    return columnApi
                },
                setDefaultValue(val) {
                    item.value = val
                    item.defaultValue = val
                    return columnApi
                },
                setOperator(operator) {
                    item.fieldOperator = operator
                    return columnApi
                },
                setPlaceholder(placeholder) {
                    item.fieldAttr.placeholder = placeholder
                    return columnApi
                },
                onRequire() { item.required = true; return columnApi }
            }

            _filter.value.push(item)
            return columnApi
        },
        registerBuildDataFunc: (fn) => {
            if (fn && typeof fn === 'function') {
                filter._overrideBuildFunc = fn
            }
        }
    })

    return filter
}