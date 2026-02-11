<script setup>
import store from '../core/store'
import { computed } from 'vue'

const props = defineProps({
    items: Array,
    title: String,
    style: Object
})

const header = computed(() => props.title ?? '工具栏')
const headerStyle = computed(() => props.style || {})
const visibleActions = computed(() => (props.items || []).filter(action => store.hasPer(action.perKey)))
</script>

<template>
    <div>
        <!--headerStyle-->
        <Column v-if="visibleActions.length > 0" :header="header" :headerStyle="headerStyle">
            <template #body="{ data }">
                <div class="flex gap-3">
                    <template v-for="(action, a) in items" :key="a">
                        <Button variant="text" v-if="store.hasPer(action.perKey) && action._hideFunc(data)"
                            :icon="action.icon" :label="action.label" @click="(e) => action._command(data, e)"
                            :severity="action.type ?? 'secondary'" />
                    </template>
                </div>
            </template>
        </Column>
    </div>
</template>