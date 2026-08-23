import { provide, ref } from 'vue'
import { useMessage } from './useMessage'

export function useDataView() {
    let loadFunc = null
    const message = useMessage()
    const keyRef = ref(null)
    const query_params = ref([])
    const data = ref([])
    const selectedNodes = ref()
    const attributes = ref({
        component: null,
        enable: false,
        enablePagination: true,
        columnCount: 6,
        defaultColumnSelectionMode: 'multiple'
    })
    const props = ref({
        lazy: false,
        first: 0,
        rows: 0,
        loading: false,
        dataKey: 'id',
        layout: 'list' // grid
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
            data.value = res?.records ?? []

            if (pagination.value !== null) {
                paginationProps.value.totalRecords = Number.parseInt(res?.total) ?? 0
            }

        } catch (e) {
            message.error('试图加载数据失败，请稍后重试')
            console.error('试图加载数据失败:', e)
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

    const setQueryParams = (filterData) => query_params.value = filterData

    const dataView = {
        registerLoader: (fn) => loadFunc = fn,
        setPageSize: (size) => {
            paginationProps.value.rows = size
            pagination.value.size = size
        },
        setPageOptions: (options) => paginationProps.value.rowsPerPageOptions = options,
        disablePagination: () => attributes.value.enablePagination = false,
        enable: () => {
            attributes.value.enable = true
            selectedNodes.value = {}
        },
        setColumnCount: (count) => {
            if (count < 1 || count > 12) {
                console.warn('columnCount 只支持 1 到 12')
                return
            }
            attributes.value.columnCount = count
        },
        setRowKey: (dataKey) => props.value.dataKey = dataKey,
        setLayout: (layout) => props.value.layout = layout,
        setComponent: (component) => attributes.value.component = component,
        reload,
        registerKey: (keyObj) => {
            keyRef.value = keyObj
        }
    }

    provide('dataView', {
        data, attributes, props, pagination, paginationProps, query_params, selectedNodes,
        load, reload, setQueryParams
    })
    return dataView
}