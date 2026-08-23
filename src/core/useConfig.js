import { useDialog } from './useDialog'
import { useForm } from './useForm'
import { useMessage } from './useMessage'
import { useTable } from './useTable'
import { useFilter } from './useFilter'
import { useToolBar } from './useToolBar'
import { useTableBar } from './useTableBar'
import { useKey } from './useKey'
import { useDataView } from './useDataView'

export function useConfig() {
    // keyMap
    const key = useKey()
    const toolbar = useToolBar()        // 工具栏 
    const tablebar = useTableBar()      // 列表工具栏
    const filter = useFilter()          // 表格筛选
    const table = useTable()            // 表格属性设置
    const form = useForm()              // 表单
    const message = useMessage()        // 消息
    const dialog = useDialog()          // dialog
    const dataView = useDataView()    // 数据试图

    toolbar.registerKey(key)
    tablebar.registerKey(key)
    table.registerKey(key)

    return { table, toolbar, tablebar, filter, dialog, form, key, message, dataView }
}

// import { useDialog } from './useDialog'
// import { useForm } from './useForm'
// import { useMessage } from './useMessage'
// import { useTable } from './useTable'
// import { useFilter } from './useFilter'
// import { useToolBar } from './useToolBar'
// import { useTableBar } from './useTableBar'
// import { useKey } from './useKey'
// import { useDataView } from './useDataView'

// export function useConfig() {
//     const cache = {}
//     const factories = {
//         key: () => useKey(),
//         toolbar: () => {
//             const instance = useToolBar()
//             if (cache.key) instance.registerKey(cache.key)
//             return instance
//         },
//         tablebar: () => {
//             const instance = useTableBar()
//             if (cache.key) instance.registerKey(cache.key)
//             return instance
//         },
//         table: () => {
//             const instance = useTable()
//             if (cache.key) instance.registerKey(cache.key)
//             return instance
//         },
//         filter: () => useFilter(),
//         form: () => useForm(),
//         message: () => useMessage(),
//         dialog: () => useDialog(),
//         dataView: () => useDataView()
//     }

//     return new Proxy({}, {
//         get(_, key) {
//             if (!factories[key]) {
//                 console.warn(`useConfig: ${String(key)} 未定义`)
//                 return undefined
//             }

//             if (!cache[key])
//                 cache[key] = factories[key]()

//             return cache[key]
//         }
//     })
// }