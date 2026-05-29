<script setup>
import store from '../core/store'
import { ref } from 'vue'

const props = defineProps({
    items: Array,
    data: Object
})
const loadingArr = ref([])
const onBarEvent = async (item, index, event) => {
    loadingArr.value[index] = true
    await item._command(props.data, event)
    loadingArr.value[index] = false
}
const validPer = (item) => {
    if (item.ignorePer) return true
    return store.hasPer(item.perKey) && item._hideFunc(props.data)
}
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <template v-for="(item, index) in items" :key="index">
            <Button v-if="validPer(item)" :loading="loadingArr[index]" @click="(e) => onBarEvent(item, index, e)"
                v-bind="item.props" />
        </template>
    </div>
</template>