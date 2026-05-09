<script setup>
import { computed, onMounted, inject, ref, watch } from 'vue'
import LayoutTablebar from './layout-tablebar.vue'
import LayoutTableColumnSolt from './layout-table-column-solt.vue'
import store from '../core/store'

const table = inject('table', {})
const filter = inject('filter', {})
const tableBar = inject('tableBar', {
    items: [],
    props: {}
})

const selectedNodes = computed({
    get: () => table.selectedNodes.value,
    set: (val) => {
        table.selectedNodes.value = val
    }
})

const data = ref([])
// const data = computed(() => buildTreeTableData(table.data.value ?? []))
const attrs = computed(() => table.attributes.value ?? {})
const props = computed(() => table.props.value ?? {})
const columns = computed(() => table.columns.value ?? [])
const tableBarItems = computed(() => tableBar.items.value ?? [])
const tableBarProps = computed(() => tableBar.props.value ?? [])
const tableBarVisible = computed(() => tableBarItems.value.some(action => store.hasPer(action.perKey)))
const paginationProps = computed(() => table.paginationProps.value ?? {})

const onPageChange = (event) => {
    if (table.pagination.value.size === event.rows) {
        table.pagination.value.index = event.page + 1
    }
    else {
        table.pagination.value.index = 1
    }

    table.pagination.value.size = event.rows
    table.load()
}

// 此树结构必须要求
const buildTreeTableData = (data) => {
    const idField = props.value.dataKey
    const pidField = props.value.dataParentKey
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

        let result = {
            data: parent,
            children
        }
        result[idField] = parent._id
        return result
    }

    return rootNodes.map(root => build(root))
}

onMounted(() => {
    table.query_params.value = filter.filterFunc()
    table.load()
})

watch(
    () => table.data.value,
    (val) => {
        data.value = buildTreeTableData(val)
    },
    { immediate: true }
)
</script>

<template>
    <div>
        <TreeTable :value="data" v-model:selectionKeys="selectedNodes" v-bind="props">
            <Column v-if="attrs.enabledDefaultColumn" expander headerStyle="width: 7rem"
                v-bind="attrs.defaultColumnProps" />
            <Column v-if="tableBarVisible && attrs.defaultColumnPosition" alignFrozen="left" v-bind="tableBarProps">
                <template #body="{ node, index }">
                    <LayoutTablebar :items="tableBarItems" :data="node?.data" />
                </template>
            </Column>
            <Column v-for="(item, i) in columns" v-show="item.visible" v-bind="item.props">
                <template #body="{ node, index }">
                    <LayoutTableColumnSolt v-if="item.template && item.template !== undefined" :data="node?.data"
                        :template="item.template" :index="index" />
                    <span v-else v-tooltip.top="String(node?.data[item.props.field])"
                        v-html="node?.data[item.props.field]" />
                </template>
            </Column>
            <Column v-if="tableBarVisible && !attrs.defaultColumnPosition" alignFrozen="right" v-bind="tableBarProps">
                <template #body="{ node, index }">
                    <LayoutTablebar :items="tableBarItems" :data="node?.data" />
                </template>
            </Column>
        </TreeTable>
        <!--Paginator-->
        <Paginator v-if="attrs.enablePagination" v-model:first="paginationProps.first" v-bind="paginationProps"
            @page="onPageChange" />
    </div>
</template>