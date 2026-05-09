import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"

export function useMessage() {
    // 消息和确认框
    const toast = useToast()
    const confirmPrivue = useConfirm()
    const createToast = (content, callback) => {
        const item = {
            severity: 'info',
            detail: content,
            life: 3000,
            group: 'tc'
        }

        const api = {
            setTitle: (title) => { item.summary = title; return api },
            setLife: (life) => { item.life = life; return api },
            setSeverity: (severity) => { item.severity = severity; return api },
            setPosition: (group) => { item.group = group; return api },
        }

        if (typeof callback === 'function') callback(api)
        if (content) toast.add(item)

        return api
    }
    const success = (content, callback) => createToast(content, (f) => {
        f.setTitle('成功').setSeverity('success')
        callback?.(f)
    })
    const info = (content, callback) => createToast(content, (f) => {
        f.setTitle('信息').setSeverity('info')
        callback?.(f)
    })
    const error = (content, callback) => createToast(content, (f) => {
        f.setTitle('错误').setSeverity('error')
        callback?.(f)
    })
    const warning = (content, callback) => createToast(content, (f) => {
        f.setTitle('警告').setSeverity('warn')
        callback?.(f)
    })
    const confirm = (content, acceptFunc, rejectFunc, callback) => {
        let item = {
            message: content,
            header: '确认',
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
            accept: () => { },
            reject: () => { }
        }

        const api = {
            accept: (func) => (item.accept = func, api),
            reject: (func) => (item.reject = func, api),
            setAcceptProps: (props) => (item.acceptProps = props, api),
            setRejectProps: (props) => (item.rejectProps = props, api),
            setIcon: (icon) => (item.icon = icon, api),
            setTitle: (title) => (item.header = title, api)
        }

        if (typeof acceptFunc === 'function') item.accept = acceptFunc
        if (typeof rejectFunc === 'function') item.reject = rejectFunc
        if (typeof callback === 'function') callback(api)
        if (content) confirmPrivue.require(item)

        return api
    }

    return {
        success,
        info,
        error,
        warning,
        confirm
    }
}