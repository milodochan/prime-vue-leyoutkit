<script setup>
import { dialogStore, registerProvide } from '../store'
import LayoutDialog from '../components/layout-dialog.vue'
import LayoutForm from '../components/layout-form.vue'

const list = dialogStore.list
registerProvide('form', LayoutForm)
</script>

<template>
    <template v-for="(dialog, index) in list" :key="index">
        <LayoutDialog :dialog="dialog" />
    </template>
</template>