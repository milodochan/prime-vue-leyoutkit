import { FormEnum } from '../enum/FormEnum'
import { markRaw, reactive, ref } from 'vue'

/**
 * 表单行 API
 * @param {*} newRow 
 * @returns 
 */
const useRowApi = (newRow) => {
    const setColumn = (field, callback, label = '') => {
        const column = {
            field,
            fieldType: FormEnum.INPUT_TEXT,
            require: false,
            disabledLabel: false,
            props: {
                name: field,
                label: label || field,
                placeholder: `请输入${label}`,
                options: []
            },
            rules: (schema) => schema, // 是一个方法
            hideFunc: () => true,
            attrFunc: null,
            command: () => { }
        }

        const disabledLabel = () => {
            column.disabledLabel = true
            return columnApi
        }
        const setRule = (rules) => {
            column.rules = rules
            return columnApi
        }
        const setLabel = (label) => {
            column.props.label = label
            column.props.placeholder = `请输入${label}`
            return columnApi
        }
        const setOptions = (options, type = FormEnum.SELECT) => {
            setType(type)
            column.props.options = options
            return columnApi
        }
        const setType = (type) => {
            column.fieldType = type
            switch (type) {
                case FormEnum.TREE_SELECT:
                    column.props.selectionMode = 'single'
                    column.props.class = 'w-full'
                    break
                case FormEnum.SELECT:
                case FormEnum.MULTI_SELECT:
                    column.props.optionValue = 'value'
                    column.props.optionLabel = 'label'
                    column.props.options = []
                    if (type === FormEnum.MULTI_SELECT) {
                        column.props.maxSelectedLabels = 3
                    }
                    break
                case FormEnum.DATE_PICKER:
                    column.props.selectionMode = 'single'
                    column.props.updateModelType = 'string'
                    column.props.showTime = true
                    column.props.hourFormat = '24'
                    column.props.dateFormat = 'yy-mm-dd'
                    break
                case FormEnum.INPUT_TEXTAREA:
                    column.props.rows = 5
                    break
                default:
                    break
            }
            return columnApi
        }
        const setPlaceholder = (text) => { column.props.placeholder = text; return columnApi }
        const onRequire = () => { column.require = true; return columnApi }
        const setAttr = (attrs = {}) => {
            if (typeof attrs !== 'object') return columnApi
            column.props = { ...column.props, ...attrs }
            return columnApi
        }
        const setComponent = (comp) => {
            if (comp) {
                column.fieldType = FormEnum.COMPONENT
                column.component = markRaw(comp)
            }
            return columnApi
        }
        const hide = (fn) => { column.hideFunc = fn; return columnApi }
        const on = (fn) => { column.command = fn; return columnApi }
        const change = (fn) => { column.attrFunc = fn; return columnApi }

        const columnApi = {
            disabledLabel, setRule, setLabel, setOptions, setType, setPlaceholder,
            onRequire, setAttr, setComponent, hide, on, change, setColumn
        }

        if (typeof callback === 'function') {
            callback(columnApi)
        }

        newRow.push(column)
        return { setColumn }
    }

    return { setColumn }
}

/**
 * useForm 钩子
 * @returns 
 */
export function useForm() {
    const register = () => {
        let data = reactive({})
        let config = ref([])

        const setRow = () => {
            let newRow = []
            config.value.push(newRow)
            return useRowApi(newRow)
        }

        const setData = (formData) => {
            data = Object.assign(data, formData) // ✅ 不换引用
        }
        return { setRow, setData, data, config }
    }

    return { register }
}