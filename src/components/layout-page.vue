<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import LayoutPageDialog from './layout-page-dialog.vue'
import LayoutPageFilter from './layout-page-filter.vue'
import LayoutPageToolbar from './layout-page-toolbar.vue'
import LayoutPageTable from './layout-page-table.vue'
import { useMessage } from '../core/useMessage'

const message = useMessage()
const selectedNodes = ref()
const props = defineProps({
    /**
     * 表格头部配置
     * 每项应包含：field: '字段名'、title: '标题'、style: '样式'
     */
    table: Object,
    /**
     * 表格工具栏
     */
    tablebar: Object,
    /**
     * 功能按钮配置
     * 每项包含：label: '名称'、icon: '图标'、secondary: '图标颜色'、command: '事件'
     */
    toolbar: Object,
    /**
     * 筛选框配置
     * 每项包含：label: '名称'、field: '字段名'、value: '字段值'
     */
    filter: Object,
    /**
     * 弹出框配置
     */
    dialog: Object
})

const filterForm = ref([])
const tableFilter = computed(() => props.filter ?? { data: [] })
const toolBar = computed(() => props.toolbar ?? { actions: [] })
const tableBar = computed(() => props.tablebar ?? { actions: [] })
const tableColumns = computed(() => props.table?.columns ?? [])
const dataTable = computed(() => {
    if (props.table?.tableType === 'treetable') {
        return buildTreeTableData(props.table.data)
    } else {
        return props.table?.data ?? []
    }
})

const pageInfo = computed(() => {
    return props.table?.pagination ?? {
        index: 0,
        size: 10,
        options: [10, 20, 30],
        total: 0
    }
})

const tableAttr = computed(() => {
    return props.table?.attr ?? {
        loading: false,
        dataKey: 'id',
        dataParentKey: 'pid',
        defaultColumnType: 'selection',
        enabledDefaultColumn: true,
        expandAll: false,
        enableTreeTable: false
    }
})

// 此树结构必须要求
const buildTreeTableData = (data) => {
    const idField = tableAttr.value.dataKey
    const pidField = tableAttr.value.dataParentKey
    const formatId = (val) => val?.toString().trim().toLowerCase() ?? ''

    // 统一格式处理
    const normalizedData = data.map(item => ({
        ...item,
        _id: formatId(item[idField]),
        _pid: formatId(item[pidField])
    }))

    const allIds = new Set(normalizedData.map(item => item._id))

    // 找出所有顶层节点（其 pid 不在 id 列中）
    const rootNodes = normalizedData.filter(item => !allIds.has(item._pid))

    const build = (parent) => {
        const children = normalizedData
            .filter(item => item._pid === parent._id)
            .map(item => build(item))

        return {
            key: parent._id,
            data: parent,
            children
        }
    }

    return rootNodes.map(root => build(root))
}

const onPageChange = (event) => {
    if (props.table) {
        props.table.pagination.index = event.first
        props.table.pagination.size = event.rows
        props.table._load()
    }
}

// 筛选按钮事件处理
const onFilterChange = (filterType) => {
    let filterData = {}
    if (!filterType) {
        // 清除数据
        filterForm.value.forEach((item, index) => {
            item.value = item.defaultValue ?? ''
        })
    }

    if (props.table) {
        filterData = filterFunc()
        props.table._setQueryParams(filterData)
        props.table._load()
    }
}

// 工具栏事件数据处理
const onToolBarEvent = (item, e) => {
    if (props.table?.tableType === 'treetable') {
        let selectObj
        if (selectedNodes.value !== undefined) {
            const selectValue = Object.keys(selectedNodes.value || {})[0] || null
            if (selectValue !== null) {
                selectObj = dataTable.value.find(a => a[tableAttr.value.dataKey].toLowerCase() === selectValue.toLowerCase())
            }
        }
        item._command(selectObj, e)
    }
    else {
        item._command(selectedNodes.value, e)
    }
}

watch(
    () => props.filter?.data ?? [],
    (val) => {
        if (Array.isArray(val)) {
            filterForm.value = val.map(item => ({ ...item }))
        } else {
            filterForm.value = []   // 默认空数组防止页面异常
        }
    },
    { immediate: true }
)

const filterFunc = () => {
    let filterData = {}
    if (props.filter) {
        let filterItems = []
        for (const item of filterForm.value) {
            if (item.required) {
                const v = item.value
                const isEmpty =
                    v === null ||
                    v === undefined ||
                    v === '' ||
                    (Array.isArray(v) && v.length === 0)

                if (isEmpty) {
                    message.warning(`请填写【${item.label}】字段`)
                    return
                }
            }

            filterItems.push({
                field: item.field,
                fieldType: item.fieldType,
                fieldOperator: item.fieldOperator,
                value: item.value
            })
        }

        console.log(filterItems)
        filterData = props.filter._buildFunc(filterItems)
    }
    return filterData
}

onMounted(() => {
    if (props.table) {
        let filterData = filterFunc()
        props.table._setQueryParams(filterData)
        props.table._load()
    }
})

</script>

<template>
    <div class="flex flex-col gap-3">
        <LayoutPageFilter v-if="tableFilter.data.length > 0" :data="filterForm" @filter="onFilterChange" />
        <LayoutPageToolbar v-if="toolBar.actions.length > 0" :data="toolBar.actions"
            @click="(item, e) => onToolBarEvent(item, e)" />
        <LayoutPageTable :data="dataTable" :table-columns="tableColumns" :table-attr="tableAttr"
            :table-bar="tableBar" />
        <Paginator v-model:first="pageInfo.index" :rows="pageInfo.size" :totalRecords="pageInfo.total"
            :rowsPerPageOptions="pageInfo.options" @page="onPageChange" />
        <LayoutPageDialog ref="dialogRef" :dialog="dialog" />
        <Toast />
        <Toast position="top-center" group="tc" />
        <Toast position="top-left" group="tl" />
        <Toast position="bottom-left" group="bl" />
        <Toast position="bottom-right" group="br" />
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.p-treetable-resizable-column) {
    background: var(--surface-card);
}
</style>