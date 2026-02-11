import { FormEnum } from '../enum/FormEnum'
import { readonly, markRaw, ref, inject, provide } from 'vue'

/**
 * 注册 provide，用于表单项插槽映射
 */
const _registerProvide = () => {
  // 获取已有 map（若无则创建）
  let slotMapRef = inject('formSlotMap', null)

  if (!slotMapRef) {
    slotMapRef = ref(new Map())
    provide('formSlotMap', slotMapRef)
  }
}

/**
 * 表单行 API
 * @param {*} newRow 
 * @returns 
 */
const useRowApi = (newRow) => {
  const rowApi = {
    setColumn(field, callback, label = '') {
      const column = {
        field,
        fieldType: FormEnum.INPUT_TEXT,
        fieldAttr: {
          label: label || field,
          placeholder: `请输入${label}`,
          require: false,
          options: []
        },
        rules: (schema) => schema, // 是一个方法
        disabledLabel: false,
        hideFunc: () => true,
        attrFunc: null,
        command: () => { }
      }

      newRow.push(column)

      const columnApi = {
        disabledLabel() {
          column.disabledLabel = true
          return columnApi
        },
        setRule(rules) {
          column.rules = rules
          return columnApi
        },
        setLabel(label) {
          column.fieldAttr.label = label
          column.fieldAttr.placeholder = `请输入${label}`
          return columnApi
        },
        setOptions(options) {
          column.fieldType = FormEnum.SELECT
          column.fieldAttr.options = options
          return columnApi
        },
        setType(type) { column.fieldType = type; return columnApi },
        setPlaceholder(text) { column.fieldAttr.placeholder = text; return columnApi },
        onRequire() { column.fieldAttr.require = true; return columnApi },
        setAttr(attrs = {}) {
          if (typeof attrs !== 'object') return columnApi
          Object.assign(column.fieldAttr, attrs)
          return columnApi
        },
        setComponent(comp) {
          if (comp) {
            column.component = markRaw(comp)
          }
          return columnApi
        },
        hide(fn) { column.hideFunc = fn; return columnApi },
        on(fn) { column.command = fn; return columnApi },
        change(fn) { column.attrFunc = fn; return columnApi },
        setColumn: rowApi.setColumn
      }

      if (typeof callback === 'function') {
        callback(columnApi)
        return rowApi
      }

      return columnApi
    }
  }
  return rowApi
}

/**
 * useForm 钩子
 * @returns 
 */
export function useForm() {
  _registerProvide()

  const _forms = ref([])
  const form = {
    list: readonly(_forms.value),
    get: (id) => _forms.value.find(f => f.id === id),
    register(id = '') {
      id = id || `form_${Date.now()}_${_forms.value.length}`
      const existing = form.get(id)
      if (existing) {
        console.warn(`Form with id "${id}" already exists. Returning the existing form.`)
      }

      const obj = {
        id,
        data: {},
        config: [],
        setRow() {
          const newRow = []
          this.config.push(newRow)
          return useRowApi(newRow)
        },
        setData(formData) {
          obj.data = formData
          return this
        }
      }

      _forms.value.push(obj)
      return obj
    }
  }

  return form
}