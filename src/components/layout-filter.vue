<script setup>
import { computed, inject } from 'vue'
import { FilterEnum } from '../enum/FilterEnum'

const emits = defineEmits(['filter'])
const table = inject('table', {})
const filter = inject('filter', {})
const filterItems = computed(() => filter.items.value ?? [])
const isShowButton = computed(() => filterItems.value.length > 0)
const onFilterChange = (type) => {
    if (!type) {
        // 清除数据
        filterItems.value.forEach((item, index) => {
            item.value = item.defaultValue ?? ''
        })
    }

    table.query_params.value = filter.filterFunc()
    type ? table.load() : table.reload()
}
</script>

<template>
    <div class="flex flex-wrap justify-left items-stretch gap-2">
        <FloatLabel v-for="(item, i) in filterItems" :key="i" variant="on" class="w-full md:w-56">
            <!-- 数字输入 -->
            <InputNumber v-if="item.fieldType === FilterEnum.NUMBER" v-model="item.value" v-bind="item.props" />
            <!-- 文本输入 -->
            <InputText v-if="item.fieldType === FilterEnum.TEXT" v-model="item.value" v-bind="item.props" />
            <!-- 下拉框 -->
            <Select v-if="item.fieldType === FilterEnum.SELECT" v-model="item.value" v-bind="item.props" />
            <!-- 日期范围 -->
            <DatePicker v-if="item.fieldType === FilterEnum.DATE_RANGE" v-model="item.value" v-bind="item.props" />
            <!-- 日期 -->
            <DatePicker v-if="item.fieldType === FilterEnum.DATE" v-model="item.value" v-bind="item.props" />
            <label :for="item.field">{{ item.props.label }}</label>
        </FloatLabel>

        <Button v-if="isShowButton" icon="pi pi-search" label="查询" v-on:click="onFilterChange(true)" :fluid="false" />
        <Button v-if="isShowButton" icon="pi pi-refresh" severity="secondary" label="重置"
            v-on:click="onFilterChange(false)" :fluid="false" />
    </div>
</template>