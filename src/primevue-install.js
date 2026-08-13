import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import './assets/style.css'

export default {
    install(app, options = {}) {
        app.use(PrimeVue, options)
        app.use(ToastService)
        app.use(ConfirmationService)
        app.use(DialogService)
    }
}