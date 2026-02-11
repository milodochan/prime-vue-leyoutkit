<script setup>
import { ref } from 'vue'
import LayoutPageTablebar from './layout-page-tablebar.vue'
import LayoutPageColumn from './layout-page-column.vue'

const props = defineProps({
    data: Array,
    tableColumns: Array,
    tableAttr: Object,
    tableBar: Object,
})

const selectedNodes = ref()
</script>

<template>
    <div>
        <DataTable v-if="!tableAttr.enableTreeTable" :value="data" v-model:selection="selectedNodes"
            :resizableColumns="true" :dataKey="tableAttr.dataKey" :loading="tableAttr.loading" stripedRows showGridlines
            tableStyle="min-width: 50rem">
            <Column v-if="tableAttr.enabledDefaultColumn" selectionMode="multiple" headerStyle="width: 3rem" />
            <LayoutPageTablebar v-if="tableBar?.position === 'left'" :title="tableBar.title"
                :items="tableBar.actions" />
            <Column :field="item.field" v-for="(item, i) in tableColumns" v-bind="item.attrs">
                <template #body="{ data }" v-if="item.template && item.template !== undefined">
                    <LayoutPageColumn :data="data" :template="item.template" />
                </template>
            </Column>
            <LayoutPageTablebar v-if="tableBar?.position === 'right'" :title="tableBar.title"
                :items="tableBar.actions" />
        </DataTable>
        <TreeTable v-if="tableAttr.enableTreeTable" v-model:selection-keys="selectedNodes" :value="dataTable"
            :loading="table.loading" showGridlines :metaKeySelection="true" :resizableColumns="true"
            selectionMode="multiple" tableStyle="min-width: 50rem">
            <Column expander headerStyle="width: 7rem" />
            <LayoutPageTablebar v-if="tableBar?.position === 'left'" :title="tableBar.title"
                :items="tableBar.actions" />
            <Column :field="item.field" v-for="(item, i) in tableColumns" v-bind="item.attrs">
                <template #body="{ data }" v-if="item.template && item.template !== undefined">
                    <LayoutPageColumn :data="data" :template="item.template" />
                </template>
            </Column>
            <LayoutPageTablebar v-if="tableBar?.position === 'right'" :title="tableBar.title"
                :items="tableBar.actions" />
        </TreeTable>
    </div>
</template>