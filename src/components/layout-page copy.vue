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

const tableBar = computed(() => {
    const defaultConfig = {
        title: '工具栏',
        width: 'auto',
        align: 'center',
        position: 'right',
        actions: [],
        style: {}
    }

    const config = {
        ...defaultConfig,
        ...(props.tablebar ?? {}),
    }

    return {
        ...config,
        style: {
            // 先保留外部传入的 style
            ...(config.style || {}),
            // 再根据字段拼接样式
            ...(config.width ? { width: config.width } : {}),
        },
    }
})



const onPageChange = (event) => {
    console.log(event)
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
        for (const item of filterForm.value) {
            if (!item.required) continue

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

        filterData = props.filter._buildFunc(filterForm.value)
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
    <div class="flex flex-col gap-4">
        <LayoutPageFilter v-if="tableFilter.data.length > 0" :data="filterForm" @filter="onFilterChange" />
        <LayoutPageToolbar v-if="toolBar.actions.length > 0" :data="toolBar.actions"
            @click="(item, e) => onToolBarEvent(item, e)" />
        <LayoutPageTable :data="dataTable" :table-columns="tableColumns" :table-attr="tableAttr"
            :table-bar="tableBar" />
        <div class="mt-2">
            <slot name="content">
                <!-- <DataTable v-if="table?.tableType === 'default'" v-model:selection="selectedNodes" :value="dataTable"
                    :rows="pageInfo.size" stripedRows :resizableColumns="true" :dataKey="tableAttr.dataKey"
                    showGridlines tableStyle="min-width: 50rem" :loading="tableAttr.loading">
                    <Column v-if="tableAttr.enabledDefaultColumn" selectionMode="multiple" headerStyle="width: 3rem" />
                    <Column v-if="visibleActions.length > 0 && tableBar.position === 'left'" :header="tableBar.title"
                        :style="tableBar.style">
                        <template #body="{ data }">
                            <template v-for="(action, a) in tableBar.actions" :key="a">
                                <Button variant="text" v-if="store.hasPer(action.perKey) && action._hideFunc(data)"
                                    :icon="action.icon" :label="action.label" @click="(e) => action._command(data, e)"
                                    :severity="action.type ?? 'secondary'" class="mr-2" />
                            </template>
</template>
</Column>
<Column :field="item.field" v-for="(item, i) in tableColumns" v-bind="item.attrs">
    <template #body="{ data }" v-if="item.template && item.template !== undefined">
                            <LayoutPageColumn :template="item.template" :data="data" />
                        </template>
</Column>
<Column v-if="visibleActions.length > 0 && tableBar.position === 'right'" :header="tableBar.title"
    :style="tableBar.style">
    <template #body="{ data }">
                            <template v-for="(action, a) in tableBar.actions" :key="a">
                                <Button variant="text" v-if="store.hasPer(action.perKey) && action._hideFunc(data)"
                                    :icon="action.icon" :label="action.label" @click="(e) => action._command(data, e)"
                                    :severity="action.type ?? 'secondary'" class="mr-2" />
                            </template>
    </template>
</Column>
</DataTable> -->
                <!-- <TreeTable v-if="table?.tableType === 'treetable'" v-model:selection-keys="selectedNodes"
                    :value="dataTable" selectionMode="multiple" :metaKeySelection="true" :resizableColumns="true"
                    showGridlines tableStyle="min-width: 50rem" :loading="table.loading">
                    <Column expander headerStyle="width: 7rem" />
                    <Column v-if="tablebar && visibleActions.length > 0 && tablebar.position === 'left'"
                        :header="tablebar.title" :style="tablebar.style">
                        <template #body="slotProps">
                            <template v-for="(action, a) in tablebar.actions" :key="a">
                                <Button v-if="action.key === 'cancel' || store.hasPer(action.key)" :icon="action.icon"
                                    :label="action.label" @click="(e) => action.command(slotProps.node.data, e)"
                                    :severity="action.secondary ?? 'secondary'" class="mr-2" />
                            </template>
                        </template>
                    </Column>
                    <Column :field="item.field" :header="item.title" v-for="(item, i) in table.columns"
                        :style="item.style">
                        <template #body="{ data }" v-if="item.template && item.template !== undefined">
                            <layoutPageColumn :template="item.template" :data="data" />
                        </template>
                    </Column>
                    <Column v-if="tablebar && visibleActions.length > 0 && tablebar.position === 'right'"
                        :header="tablebar.title" :style="tablebar.style">
                        <template #body="slotProps">
                            <template v-for="(action, a) in tablebar.actions" :key="a">
                                <Button v-if="action.key === 'cancel' || store.hasPer(action.key)" :icon="action.icon"
                                    :label="action.label" @click="(e) => action.command(slotProps.node.data, e)"
                                    :severity="action.secondary ?? 'secondary'" class="mr-2" />
                            </template>
                        </template>
                    </Column>
                </TreeTable> -->
            </slot>
        </div>

        <div class="mt-2 rounded" v-if="pageInfo !== null">
            <slot name="footer">
                <Paginator v-model:first="pageInfo.index" :rows="pageInfo.size" :totalRecords="pageInfo.total"
                    :rowsPerPageOptions="pageInfo.options" @page="onPageChange" />
            </slot>
        </div>

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