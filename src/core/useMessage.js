import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

export function useMessage() {
    // 消息和确认框
    const toast = useToast()
    const confirm = useConfirm()
    const message = {
        success: (content, title = '成功') => {
            toast.add({ severity: 'success', summary: title, detail: content, life: 3000, group: 'tc' })
        },
        info: (content, title = '信息') => {
            toast.add({ severity: 'info', summary: title, detail: content, life: 3000, group: 'tc' })
        },
        error: (content, title = '错误') => {
            toast.add({ severity: 'error', summary: title, detail: content, life: 3000, group: 'tc' })
        },
        warning: (content, title = '警告') => {
            toast.add({ severity: 'warn', summary: title, detail: content, life: 3000, group: 'tc' })
        },
        confirm: (content, accept = () => { }, reject = () => { }, title = '确认') => {
            confirm.require({
                message: content,
                header: title,
                icon: 'pi pi-info-circle',
                rejectProps: {
                    label: '取消',
                    severity: 'secondary',
                    outlined: true
                },
                acceptProps: {
                    label: '确认',
                    severity: 'danger',
                },
                accept: accept,
                reject: reject
            })
        }
    }

    return message
}