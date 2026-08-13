import { ref, getCurrentInstance, provide } from 'vue'
import { FilterEnum } from '../enum/FilterEnum'
import { useMessage } from '../core/useMessage'

export function useFilter() {
    const instance = getCurrentInstance()
    const globalBuildDataFunc = instance?.appContext.config.globalProperties.$layoutkitBuildDataFunc
    const message = useMessage()

    let _overrideBuildFunc = null
    const items = ref([])
    const buildFunc = (items) => {
        if (_overrideBuildFunc && typeof _overrideBuildFunc === 'function') {
            return _overrideBuildFunc(items)
        }

        if (globalBuildDataFunc && typeof globalBuildDataFunc === 'function') {
            return globalBuildDataFunc(items)
        }

        return Object.fromEntries(
            items.map(item => [item.field, item.value])
        )
    }
    const filterFunc = () => {
        if (items.value.length === 0) return {}

        let filterItems = []
        for (const item of items.value) {
            if (item.required) {
                const v = item.value
                const isEmpty =
                    v === null ||
                    v === undefined ||
                    v === '' ||
                    (Array.isArray(v) && v.length === 0)

                if (isEmpty) {
                    message.warning(`请填写【${item.props.label}】字段`)
                    return null
                }
            }

            filterItems.push({
                field: item.field,
                fieldType: item.fieldType,
                fieldOperator: item.fieldOperator,
                value: item.value
            })
        }

        return buildFunc(filterItems)
    }

    const register = (field, label = '') => {
        let item = {
            field,
            fieldType: FilterEnum.TEXT,
            fieldOperator: '=',
            required: false,
            defaultValue: '',
            value: '',
            props: {
                id: field,
                label: label || field,
                style: { minwidth: '100px' },
                class: 'w-full'
            }
        }

        const setAttr = (attrs = {}) => {
            if (typeof attrs !== 'object') return columnApi
            item.props = { ...item.props, ...attrs }
            return columnApi
        }
        const setOptions = (options) => {
            setType(FilterEnum.SELECT)
            item.props.options = options
            return columnApi
        }
        const setType = (type) => {
            item.fieldType = type
            switch (type) {
                case FilterEnum.NUMBER:
                    item.props.mode = 'decimal'
                    break
                case FilterEnum.SELECT:
                    item.props.optionValue = 'value'
                    item.props.optionLabel = 'label'
                    item.props.options = []
                    break
                case FilterEnum.DATE:
                case FilterEnum.DATE_RANGE:
                    item.props.selectionMode = type === FilterEnum.DATE_RANGE ? 'range' : 'single'
                    item.props.updateModelType = 'string'
                    item.props.showTime = true
                    item.props.hourFormat = '24'
                    item.props.inputClass = 'w-full'
                    item.props.dateFormat = "yy-mm-dd"
                    if (type === FilterEnum.DATE_RANGE) {
                        item.props.manualInput = false
                    }
                    break
                default:
                    item.props.autocomplete = 'off'
                    break
            }
            return columnApi
        }
        const setValue = (val) => {
            item.value = val
            return columnApi
        }
        const setDefaultValue = (val) => {
            item.value = val
            item.defaultValue = val
            return columnApi
        }
        const setOperator = (operator) => {
            item.fieldOperator = operator
            return columnApi
        }
        const setPlaceholder = (placeholder) => {
            item.props.placeholder = placeholder
            return columnApi
        }
        const onRequire = () => { item.required = true; return columnApi }

        const columnApi = {
            setAttr,
            setOptions,
            setType,
            setValue,
            setDefaultValue,
            setOperator,
            setPlaceholder,
            onRequire
        }

        items.value.push(item)
        return columnApi
    }
    const registerBuildDataFunc = (fn) => {
        if (!fn || typeof fn !== 'function') return
        _overrideBuildFunc = fn
    }

    provide('filter', {
        items, filterFunc
    })

    return {
        register, registerBuildDataFunc
    }
}