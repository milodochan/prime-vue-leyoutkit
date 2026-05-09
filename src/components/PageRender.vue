<script setup>
import { computed, inject } from 'vue'
import LayoutFilter from '../components/layout-filter.vue'
import LayoutToolbar from '../components/layout-toolbar.vue'
import LayoutTable from '../components/layout-table.vue'
import LayoutTreetable from '../components/layout-treetable.vue'

const table = inject('table', {})
const filter = inject('filter', {})
const toolBar = inject('toolBar', {})
const isShowFilterButton = computed(() => filter.items.value.length > 0)
const isShowToolBarButton = computed(() => toolBar.items.value.length > 0)
const enableTreeTable = computed(() => table.attributes.value.enableTreeTable ?? false)
</script>

<template>
    <div class="flex flex-col gap-3">
        <LayoutFilter v-if="isShowFilterButton" />
        <LayoutToolbar v-if="isShowToolBarButton" />
        <LayoutTable v-if="!enableTreeTable" />
        <LayoutTreetable v-if="enableTreeTable" />
    </div>
</template>