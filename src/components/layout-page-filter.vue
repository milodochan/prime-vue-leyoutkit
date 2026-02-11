<script setup>
import { FilterEnum } from '../enum/FilterEnum'

const emits = defineEmits(['filter'])
const props = defineProps({
    /**
     * 筛选框配置
     * 每项包含：label: '名称'、field: '字段名'、value: '字段值'
     */
    data: { type: Array },
})

const onFilterChange = (type) => {
    emits('filter', type)
}

</script>

<template>
    <div class="flex flex-wrap justify-left items-stretch gap-2">
        <FloatLabel v-for="(item, i) in data" :key="i" variant="on" class="w-full md:w-56">
            <!-- 数字输入 -->
            <InputNumber v-if="item.fieldType === FilterEnum.NUMBER" :id="item.field" v-model="item.value"
                autocomplete="off" mode="decimal" class="w-full" v-bind="item.fieldAttr" />
            <!-- 文本输入 -->
            <InputText v-if="item.fieldType === FilterEnum.TEXT" :id="item.field" v-model="item.value"
                autocomplete="off" class="w-full" v-bind="item.fieldAttr" />
            <!-- 下拉框 -->
            <Select v-if="item.fieldType === FilterEnum.SELECT" :id="item.field" v-model="item.value"
                :options="item.options" option-value="value" option-label="label" class="w-full"
                v-bind="item.fieldAttr" />
            <!-- 日期范围 -->
            <DatePicker v-if="item.fieldType === FilterEnum.DATE_RANGE" :id="item.field" v-model="item.value"
                selectionMode="range" dateFormat="yy-mm-dd" :manualInput="false" class="w-full" inputClass="w-full"
                v-bind="item.fieldAttr" />
            <!-- 日期 -->
            <DatePicker v-if="item.fieldType === FilterEnum.DATE" :id="item.field" v-model="item.value"
                dateFormat="yy-mm-dd" class="w-full" inputClass="w-full" v-bind="item.fieldAttr" />
            <label :for="item.field">{{ item.fieldAttr.label }}</label>
        </FloatLabel>

        <Button icon="pi pi-search" label="查询" v-on:click="onFilterChange(true)" :fluid="false" />
        <Button icon="pi pi-refresh" severity="secondary" label="重置" v-on:click="onFilterChange(false)"
            :fluid="false" />
    </div>
</template>