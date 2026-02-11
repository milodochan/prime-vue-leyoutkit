import { reactive, readonly, ref } from 'vue'

const createDescriptions = (title, config) => {
    const descriptions = {}
}

export function useDetail() {
    const _details = ref([])    // [[{},],[{}]]
    const detail = reactive({
        configs: readonly(_details.value),
        setRow() {
            const newRow = []
            this.configs.push(newRow)

            const rowApi = {
                setColumn(data, config, callback) {
                    const column = {
                        data,
                        config,
                        columnType: '',
                        hideFunc: () => true,
                        command: () => { }
                    }

                    newRow.push(column)

                    const columnApi = {
                        setType(type) { column.columnType = type; return columnApi },
                        setConfig(conf) { column.config = conf; return columnApi },
                        setData(data) { column.data = data; return columnApi },
                        // setOptions(options) { column.fieldAttr.options = options; return columnApi },
                        // setPlaceholder(text) { column.fieldAttr.placeholder = text; return columnApi },
                        // onRequire() { column.fieldAttr.require = true; return columnApi },
                        // setAttr(attrs = {}) { Object.assign(column.fieldAttr, attrs); return columnApi },
                        // setComponent(comp) { if (comp) column.component = markRaw(comp); return columnApi },
                        // hide(fn) { column.hideFunc = fn; return columnApi },
                        // on(fn) { column.command = fn; return columnApi },
                        // setColumn: rowApi.setColumn
                    }

                    if (typeof callback === 'function') {
                        callback(columnApi)
                        return rowApi
                    }

                    return columnApi
                }
            }

            return rowApi
        },
    })

    return detail
}