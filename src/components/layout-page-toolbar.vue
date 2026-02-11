<script setup>
import store from '../core/store'

const emits = defineEmits(['click'])
const props = defineProps({
    /**
     * 筛选框配置
     * 每项包含：label: '名称'、field: '字段名'、value: '字段值'
     */
    data: { type: Array },
})

const onToolBarEvent = (item, event) => {
    emits('click', item, event)
}

</script>

<template>
    <div>
        <ButtonGroup>
            <!--如果需要支持数据表格列的控制可以在这个位置加控制-->
            <!--此处需要权限限制-->
            <template v-for="(item, i) in data" :key="i">
                <Button v-if="store.hasPer(item.perKey)" :label="item.label" :icon="item.icon"
                    :severity="item.type ?? 'secondary'" variant="outlined" @click="(e) => onToolBarEvent(item, e)" />
            </template>
            <!--还需要扩展传入自定义组件在这个位置， 例如订单列表的展示内容-->
        </ButtonGroup>
    </div>
</template>