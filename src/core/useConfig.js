import { useDialog } from './useDialog'
import { useForm } from './useForm'
import { useMessage } from './useMessage'
import { useTable } from './useTable'
import { useFilter } from './useFilter'
import { useToolBar } from './useToolBar'
import { useTableBar } from './useTableBar'
import { useKey } from './useKey'

export function useConfig() {
    // keyMap
    const key = useKey()
    // 工具栏
    const toolbar = useToolBar()
    toolbar.registerKey(key)
    // 列表工具栏
    const tablebar = useTableBar()
    tablebar.registerKey(key)
    // 表格筛选
    const filter = useFilter()
    // 表格属性设置
    const table = useTable()
    table.registerKey(key)
    // 表单
    const form = useForm()
    // 消息和确认框
    const message = useMessage()
    // dialog
    const dialog = useDialog()

    return { table, toolbar, tablebar, filter, dialog, form, key, message }
}