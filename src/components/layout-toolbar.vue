<script setup>
import store from '../core/store'
import { computed, inject } from 'vue'

const table = inject('table', {})
const toolBar = inject('toolBar', {})
const toolBarItems = computed(() => toolBar.items.value ?? [])
const onBarEvent = async (item, event) => {
    item.loading = true
    await item._command(table.selectedNodes.value ?? null, event)
    item.loading = false
}
</script>

<template>
    <div>
        <ButtonGroup>
            <!--如果需要支持数据表格列的控制可以在这个位置加控制-->
            <!--此处需要权限限制-->
            <template v-for="(item, i) in toolBarItems" :key="i">
                <Button v-if="store.hasPer(item.perKey)" @click="(e) => onBarEvent(item, e)" v-bind="item.props" />
            </template>
            <!--还需要扩展传入自定义组件在这个位置， 例如订单列表的展示内容-->
        </ButtonGroup>
    </div>
</template>