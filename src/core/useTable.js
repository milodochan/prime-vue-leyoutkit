import { computed, reactive, ref, inject, provide } from 'vue'
import { useMessage } from './useMessage'

/**
 * 注册 provide，用于表单项插槽映射
 */
const _registerProvide = () => {
    // 获取已有 map（若无则创建）
    let slotMapRef = inject('columnSlotMap', null)

    if (!slotMapRef) {
        slotMapRef = ref(new Map())
        provide('columnSlotMap', slotMapRef)
    }
}

export function useTable() {
    _registerProvide()

    const message = useMessage()
    const _table_columns = ref([])
    const _table_data = ref([])
    const _table_query_params = ref({})
    const _loadEvent = ref(null)
    const table = reactive({
        data: computed(() => _table_data.value),
        columns: computed(() => _table_columns.value),
        pagination: {
            index: 0,
            size: 10,
            options: [10, 20, 30],
            total: 0
        },
        attr: {
            enableTreeTable: false,
            loading: false,
            dataKey: 'id',
            dataParentKey: 'pid',
            defaultColumnType: 'selection',
            enabledDefaultColumn: true,
            expandAll: false,
            //treeProps: "{ hasChildren: 'hasChildren', children: 'children', checkStrictly: false }",
        },
        _setQueryParams: (filterData) => { _table_query_params.value = filterData },
        setPageSize: (size) => { table.pagination.size = size },
        setPageOptions: (options) => { table.pagination.options = options },
        setRowKey: (dataKey) => {
            table.attr.dataKey = dataKey
        },
        setParentKey: (dataKey) => {
            table.attr.dataParentKey = dataKey
        },
        setDefaultColumnType: (type) => {
            table.attr.defaultColumnType = type
        },
        disabledDefaultCloumn: () => {
            table.attr.enabledDefaultColumn = false
        },
        enableTree: () => {
            table.attr.enableTreeTable = true
        },
        setColumn: (field, label = '') => {
            const column = {
                field,
                attrs: {
                    width: '',
                    header: label || field
                },
                template: undefined,
                setAttr(attrs = {}) {
                    if (typeof attrs !== 'object') return this
                    Object.assign(column.attrs, attrs)
                    return this
                },
                setTemplate(template) {
                    this.template = template
                    return this
                }
            }

            _table_columns.value.push(column)
            return column
        },
        registerLoader: (fn) => {
            _loadEvent.value = fn
        },
        _load: async () => {
            if (typeof _loadEvent.value !== 'function') {
                console.warn('未设置 load 函数，请使用 table.registerLoader(fn) 进行设置')
                return
            }

            table.attr.loading = true
            const { index = 0, size = 10 } = table.pagination ?? {}
            try {
                const res = await _loadEvent.value({ index, size }, _table_query_params.value)
                switch (table.tableType) {
                    case 'treetable':
                        _table_data.value = res
                        break
                    case 'default':
                    default:
                        // 此处预处理数据判断数据是否包含分页信息
                        _table_data.value = res.records ?? []
                        break
                }

                if (table.pagination !== null) {
                    table.pagination.total = res.total ?? 0
                }
            } catch (e) {
                // 可选：提示用户
                message.error('表格加载数据失败，请稍后重试')
                console.error('表格加载数据失败:', e)
            } finally {
                table.attr.loading = false
            }
        },
        reload: async () => {
            if (table.pagination !== null) table.pagination.index = 0
            await table._load()
        }
    })

    return table
}