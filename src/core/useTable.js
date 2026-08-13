import store from './store'
import { provide, ref } from 'vue'
import { useMessage } from './useMessage'
import Tag from 'primevue/tag'

export function useTable() {
    let loadFunc = null
    const message = useMessage()
    const keyRef = ref(null)
    const query_params = ref([])
    const data = ref([])
    const columns = ref([])
    const selectedNodes = ref()
    const attributes = ref({
        enableTreeTable: false,
        enabledDefaultColumn: true,
        enablePagination: true,
        defaultColumnSelectionMode: 'multiple',
        defaultColumnPosition: false,
        defaultColumnProps: {
            headerStyle: {
                width: '3rem'
            }
        }
    })
    const props = ref({
        resizableColumns: true,
        stripedRows: true,
        showGridlines: true,
        scrollable: true,
        tableStyle: {
            minWidth: '50rem'
        },
        loading: false,
        dataKey: 'id',
        dataParentKey: 'pid',
        metaKeySelection: true
    })
    const pagination = ref({
        index: 1,
        size: 10,
    })
    const paginationProps = ref({
        first: 0,
        rows: 10,
        rowsPerPageOptions: [10, 20, 30],
        totalRecords: 0
    })
    const load = async () => {
        if (typeof loadFunc !== 'function') {
            console.warn('未设置 registerLoader 函数')
            return
        }

        props.value.loading = true

        const { index, size } = pagination.value ?? {}
        try {
            const res = await loadFunc({ index, size }, query_params.value)

            data.value = attributes.value.enableTreeTable
                ? res ?? []
                : (res?.records ?? [])

            if (pagination.value !== null) {
                paginationProps.value.totalRecords = Number.parseInt(res?.total) ?? 0
            }

        } catch (e) {
            message.error('表格加载数据失败，请稍后重试')
            console.error('表格加载数据失败:', e)
        } finally {
            props.value.loading = false
        }
    }

    const reload = async () => {
        if (pagination.value !== null) pagination.value.index = 1
        if (paginationProps.value !== null) {
            paginationProps.value = {
                ...paginationProps.value,
                first: 0
            }
        }
        if (attributes.value.defaultColumnSelectionMode === 'multiple') {
            selectedNodes.value = []  // 多选模式用空数组
        } else {
            selectedNodes.value = null  // 单选模式用 null
        }
        await load()
    }

    const setQueryParams = (filterData) => {
        query_params.value = filterData
    }

    const createTemplateBuilder = () => {
        const data = {}
        return {
            setComponent(component) {
                data.component = component
                return this
            },
            setContent(content) {
                data.content = content
                return this
            },
            setTooltip(tooltip) {
                data.tooltip = tooltip
                return this
            },
            setProps(props) {
                data.props = props
                return this
            },
            build() {
                return data
            },
            hasValue() {
                return Object.keys(data).length > 0
            }
        }
    }

    const table = {
        registerLoader: (fn) => loadFunc = fn,
        setPageSize: (size) => {
            paginationProps.value.rows = size
            pagination.value.size = size
        },
        setPageOptions: (options) => paginationProps.value.rowsPerPageOptions = options,
        setRowKey: (dataKey) => props.value.dataKey = dataKey,
        setParentKey: (dataKey) => props.value.dataParentKey = dataKey,
        disabledDefaultCloumn: () => attributes.value.enabledDefaultColumn = false,
        enabledTree: () => {
            attributes.value.enableTreeTable = true
            selectedNodes.value = {}
        },
        enabledLeftPosition: () => attributes.value.defaultColumnPosition = true,
        disabledPagination: () => attributes.value.enablePagination = false,
        setColumn: (field, label = '') => {
            let columnAttributes = {
                contentLength: null,
                template: null,
                visible: true,
                props: {
                    field,
                    style: {},
                    header: label || field
                }
            }

            const enabledPer = (id) => {
                columnAttributes.visible = store.hasPer(keyRef.value.get(id))
                return column
            }
            const setTemplate = (template) => {
                columnAttributes.template = (row) => {
                    const builder = createTemplateBuilder()
                    const result = template(row, builder)
                    // builder 模式
                    if (builder.hasValue()) {
                        return builder.build()
                    }
                    // 普通 return
                    return result
                }

                return column
            }
            const setWidth = (width) => {
                columnAttributes.props.style = { ...columnAttributes.props.style, width }
                return column
            }
            const setStyle = (style) => {
                columnAttributes.props.style = { ...columnAttributes.props.style, ...style }
                return column
            }
            const setAttr = (attrs = {}) => {
                if (typeof attrs !== 'object') return this
                columnAttributes.props = { ...columnAttributes.props, ...attrs }
                return column
            }
            const setContentLength = (length) => {
                columnAttributes.contentLength = length
                return column
            }
            const setTag = (contentStatusMap = {}, tagStatusMap = {}) => {
                setTemplate((item, temp) => {
                    const value = item[columnAttributes.props.field]
                    const content = contentStatusMap[value] ?? value
                    const severity = tagStatusMap[value]

                    temp.setComponent(Tag)
                        .setContent(content)

                    // 只有 severity 有值时才设置 props
                    if (severity)
                        temp.setProps({ severity })
                })
                return column
            }
            const column = { enabledPer, setTemplate, setWidth, setStyle, setAttr, setContentLength, setTag }
            columns.value.push(columnAttributes)
            return column
        },
        reload,
        registerKey: (keyObj) => {
            keyRef.value = keyObj
        }
    }

    provide('table', {
        data, columns, attributes, props, pagination, paginationProps, query_params, selectedNodes,
        load, reload, setQueryParams
    })
    return table
}