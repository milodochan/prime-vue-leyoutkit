<script setup>
import { computed, onMounted, inject } from 'vue'
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
const data = computed(() => table.data.value ?? [])
const attrs = computed(() => table.attributes.value ?? {})
const props = computed(() => table.props.value ?? {})
const columns = computed(() => table.columns.value ?? [])
const tableBarItems = computed(() => tableBar.items.value ?? [])
const tableBarProps = computed(() => tableBar.props.value ?? [])
const tableBarVisible = computed(() => tableBarItems.value.some(action => store.hasPer(action.perKey)))
const paginationProps = computed(() => {
    let dd = table.paginationProps.value ?? {}
    console.log(dd)
    return dd
})

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

onMounted(() => {
    table.query_params.value = filter.filterFunc()
    table.load()
})
</script>

<template>
    <div>
        <!--DataTable-->
        <DataTable :value="data" v-model:selection="selectedNodes" v-bind="props">
            <Column v-if="attrs.enabledDefaultColumn" :selectionMode="attrs.defaultColumnSelectionMode"
                v-bind="attrs.defaultColumnProps" />
            <Column v-if="tableBarVisible && attrs.defaultColumnPosition" alignFrozen="left" v-bind="tableBarProps">
                <template #body="{ data, index }">
                    <LayoutTablebar :items="tableBarItems" :data="data" />
                </template>
            </Column>
            <Column v-for="(item, i) in columns" v-show="item.visible" v-bind="item.props">
                <template #body="{ data, index }">
                    <LayoutTableColumnSolt v-if="item.template && item.template !== undefined" :data="data"
                        :template="item.template" :index="index" />
                    <span v-else v-tooltip.top="String(data[item.props.field])" v-html="data[item.props.field]" />
                </template>
            </Column>
            <Column v-if="tableBarVisible && !attrs.defaultColumnPosition" alignFrozen="right" v-bind="tableBarProps">
                <template #body="{ data, index }">
                    <LayoutTablebar :items="tableBarItems" :data="data" />
                </template>
            </Column>
        </DataTable>
        <!--Paginator-->
        <Paginator v-if="attrs.enablePagination" v-model:first="paginationProps.first" v-bind="paginationProps"
            @page="onPageChange" />
    </div>
</template>