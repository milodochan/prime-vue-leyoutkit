<script setup>
import { computed, onMounted, inject, ref } from 'vue'
import { dataViewSlotStore } from '../store'

const dataView = inject('dataView', {})
const filter = inject('filter', {})

const dialogKey = ref(`${Date.now()}-${Math.random()}`)
const data = computed(() => dataView.data.value ?? [])
const attrs = computed(() => dataView.attributes.value ?? {})
const props = computed(() => dataView.props.value ?? {})
const paginationProps = computed(() => dataView.paginationProps.value ?? {})

const onPageChange = (event) => {
    dataView.pagination.value.size === event.rows
        ? dataView.pagination.value.index = event.page + 1
        : dataView.pagination.value.index = 1

    dataView.pagination.value.size = event.rows
    dataView.load()
}

// 当前内容组件
const currentComponent = computed(() => {
    const comp = attrs.value.component
    if (!comp) return null

    if (typeof comp === 'string' && dataViewSlotStore.value.has(comp)) {
        return dataViewSlotStore.value.get(comp) || null
    }

    // 真实组件对象 或者 defineAsyncComponent
    if (typeof comp === 'object' || typeof comp === 'function') {
        return comp
    }

    return null
})

onMounted(() => {
    const filterData = filter.filterFunc()
    if (filterData === null) return

    dataView.query_params.value = filterData
    dataView.load()
})
</script>

<template>
    <div>
        <!--DataTable-->
        <DataView :value="data" v-bind="props">
            <template #list="slotProps">
                <div class="flex flex-col">
                    <div v-for="(item, index) in slotProps.items" :key="index">
                        <component v-if="currentComponent" :key="dialogKey" :is="currentComponent" v-bind="item" />
                    </div>
                </div>
            </template>
            <template #grid="slotProps">
                <div class="grid gap-2" :class="`grid-cols-${attrs?.columnCount ?? 6}`">
                    <div v-for="(item, index) in slotProps.items" :key="index">
                        <component v-if="currentComponent" :key="dialogKey" :is="currentComponent" v-bind="item" />
                    </div>
                </div>
            </template>
        </DataView>
        <!--Paginator-->
        <Paginator v-if="attrs.enablePagination" v-model:first="paginationProps.first" v-bind="paginationProps"
            @page="onPageChange" />
    </div>
</template>