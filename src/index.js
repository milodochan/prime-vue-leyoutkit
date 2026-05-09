export { default as LayoutForm } from './components/layout-form.vue'
export { default as LayoutMessage } from './components/layout-message.vue'
export { default as DialogContentSlot } from './components/dialog-content-slot.vue'
export { default as FormItemSlot } from './components/form-item-slot.vue'
export { default as ColumnItemSlot } from './components/column-item-slot.vue'
export { default as LayoutTable } from './components/layout-table.vue'
export { default as PageRender } from './components/PageRender.vue'
export { default as DialogRender } from './components/DialogRender.vue'

// Hooks / store
export { useDialog } from './core/useDialog'
export { useForm } from './core/useForm'
export { useConfig } from './core/useConfig'
export { useMessage } from './core/useMessage'
export { useTable } from './core/useTable'
export { useTableBar } from './core/useTableBar'
export { default as store } from './core/store'

// enum
export { FilterEnum } from './enum/FilterEnum'
export { FilterOperatorEnum } from './enum/FilterOperatorEnum'
export { FormEnum } from './enum/FormEnum'
// 
// export { registerPrimeVueComponents } from './primevueRegister'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import './assets/style.css' // 引入组件库样式

export default {
    install(app, options = {}) {
        app.use(PrimeVue, options)
        app.use(ToastService)
        app.use(ConfirmationService)
        app.use(DialogService)
    }
}