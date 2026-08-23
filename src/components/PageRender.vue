<script setup>
import { computed, inject } from 'vue'
import LayoutFilter from '../components/layout-filter.vue'
import LayoutToolbar from '../components/layout-toolbar.vue'
import LayoutTable from '../components/layout-table.vue'
import LayoutTreetable from '../components/layout-treetable.vue'
import LayoutDataView from '../components/layout-data-view.vue'

const table = inject('table', {})
const filter = inject('filter', {})
const toolBar = inject('toolBar', {})
const dataView = inject('dataView', {})
const isShowFilterButton = computed(() => filter.items.value.length > 0)
const isShowToolBarButton = computed(() => toolBar.items.value.length > 0)
const enableTable = computed(() => table.attributes.value.enableTable ?? false)
const enableTreeTable = computed(() => table.attributes.value.enableTreeTable ?? false)
const enableDataView = computed(() => dataView?.attributes?.value?.enable ?? false)
</script>

<template>
    <div class="flex flex-col gap-3">
        <LayoutFilter v-if="isShowFilterButton" />
        <LayoutToolbar v-if="isShowToolBarButton" />
        <LayoutTable v-if="enableTable" />
        <LayoutTreetable v-if="enableTreeTable" />
        <LayoutDataView v-if="enableDataView" />
    </div>
</template>