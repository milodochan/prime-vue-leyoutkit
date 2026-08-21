# @layoutkit/prime-vue-layoutkit

`@layoutkit/prime-vue-layoutkit` 是一个基于 PrimeVue UI 的工厂函数库，用于生成页面基础配置对象，提供表格、表单、对话框、工具栏、筛选器、消息提示等功能，常用于后台管理系统页面。

# 安装（Installation）
```
npm install @layoutkit/prime-vue-layoutkit@latest
```

# 导出内容总览
以下是该包对外全部导出的内容列表：

## 一、组件（Components）
| 组件名                   | 说明                         |
| --------------------- | -------------------------- |
| `DialogRender`      | 弹窗包装组件，支持动态内容加载、缓存、按钮自定义等  |
| `PageRender`        | 页面级布局组件，用于表格 + 工具栏 + 筛选 + 分页等场景 |
| `LayoutTable`       | 表格组件，根据配置自动渲染表格         |
| `LayoutForm`        | 动态表单组件，根据配置自动渲染表单项         |
| `DialogContentSlot` | Dialog 内容插槽扩展组件            |
| `FormItemSlot`      | 表单项插槽扩展组件                  |
| `ColumnItemSlot`    | 表格列插槽扩展组件                  |
| `LayoutMessage`     | 消息组件                  |

使用方式：
```
import { ColumnItemSlot, PageRender,... } from '@layoutkit/prime-vue-layoutkit'
```

消息及弹窗使用方式（在 `App.vue` 中新增）：
``` vue
<script setup>
import { DialogRender, LayoutMessage } from '@layoutkit/prime-vue-layoutkit'
</script>

<template>
    <router-view />
    <LayoutMessage />
    <DialogRender />
</template>
```

## 二、Hooks & Store

| 方法名                 |  使用方式  | 说明                         |
| --------------------- | -------------------------- | -------------------------- |
| `useConfig`     | const { table, toolbar, tablebar, filter, dialog, form, key, message } = useConfig()  | 配合 PageRender 使用，集成了所有 hooks，具体 api 参考其他 hooks  |
| `useDialog`     | const dialog = useDialog()      | 弹窗 |
| `useForm`       | const form = useForm()          | 表单         |
| `useTable`      | const table = useTable()        | 表格         |
| `useTableBar`   | const tablebar = useTableBar()  | 表格工具栏            |
| `useLayout`     | const layout = useLayout()      | 布局状态（主题、菜单模式、深浅色等），需配合 Layout 模板使用 |
| `useTabStore`   | const tabStore = useTabStore()  | 多标签页状态管理（新增、切换、关闭标签等） |
| `useMessage`    | const message = useMessage()    | 消息与确认弹窗                  |
| `store`         | import { store } from '...'     | 权限存储（localStorage/sessionStorage 加密持久化） |
| `LayoutKit`     | app.use(LayoutKit)              | PrimeVue 全局安装插件（组件、指令、主题样式） |

## 三、枚举类型（Enums）
| 枚举                     | 作用                                     |
| ---------------------- | -------------------------------------- |
| `FilterEnum`         | 页面筛选器类型（text / number / select / date 等）       |
| `FilterOperatorEnum` | 筛选器操作符（=、like、between 等）               |
| `FormEnum`           | 表单项类型定义（input、textarea、select、radio 等） |

示例：
```js
import { FormEnum } from '@layoutkit/prime-vue-layoutkit'

if (field.type === FormEnum.SELECT) { ... }
```


# 快速开始（Usage）

* 需要在 `main.js` 中全局安装插件：
```js
import { createApp } from 'vue'
import App from './App.vue'
import LayoutKit from '@layoutkit/prime-vue-layoutkit'
import '@layoutkit/prime-vue-layoutkit/style.css'

const app = createApp(App)
app.use(LayoutKit)
app.mount('#app')
```

* 需要在项目中使用权限管理相关设置，如下代码所示。
```js
import { store as storePer } from '@layoutkit/prime-vue-layoutkit'
# 默认数据存储到 localStorage 中，如需 sessionStorage，请调用 storePer.enabledSession()，更多使用参考 store 相关内容。
async getPermission() {
    try {
        const res = await api.getPermission()
        if (res.code === 0) {
            this.menus = res.data.menus.sort((a, b) => a.sort - b.sort)
            this.permissions = res.data.pers
            this.userInfo = res.data.userInfo
            if (res.data.super) storePer.disablePer()  // 超管不验证权限
            else {
                storePer.set(res.data.pers)             // 将权限数据传递给权限控制模块
                storePer.enablePer()                   // 启用权限控制   
            }
        }
        return res
    } catch (error) {
        this.menus = []
        throw error
    }
}
```

* PageRender 组件中的筛选功能
```js
# PageRender 组件中的筛选相关功能默认数据格式为普通 json 对象（{ field: value }），如需其他数据格式需要使用如下方法重写
app.config.globalProperties.$layoutkitBuildDataFunc = (items) => { return items }

# items 数据结构如下
[{
  field: '',              // 字段名
  fieldType: 'text',      // 字段类型（FilterEnum）
  fieldOperator: '=',     // 查询操作符
  value: ''               // 查询值
}]
```

---

# API 文档（API）

## useTable，或者 useConfig 中提供的 table

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `registerLoader`          | 注册表格加载函数，需返回数据格式： { total: 0, records: [] } , 树形表格返回 [] 即可       |
| `setPageSize`             | 设置分页大小 |
| `setPageOptions`          | 设置分页选项 |
| `setRowKey`               | 数据行的字段 |
| `setParentKey`            | 树结构表格数据行的父级字段 |
| `disableDefaultCloumn`   | 禁用默认列 |
| `enableTree`             | 启用树结构表格 |
| `enableLeftPosition`     | 启用左侧工具栏，默认右侧 |
| `disablePagination`      | 禁用分页组件 |
| `reload`                  | 重新加载表格，并将分页页码重置为 1 |
| `registerKey`             | 注册权限对象 |
| `setColumn`               | 表格列函数，详细参考下面表格               |

### setColumn
| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `enablePer`          | 设置列是否使用权限控制      |
| `setTemplate`         | 重写列的内容，支持返回一般内容以及使用组件返回 |
| `setWidth`            | 设置列的宽度 |
| `setStyle`            | 设置列的样式 |
| `setAttr`             | 设置列的属性 |
| `setContentLength`    | 设置内容截断长度，超长省略号展示 |
| `setTag`              | 快捷设置内容标签，`setTag(contentStatusMap, tagStatusMap)` |


### 代码参考
``` js
table.enableLeftPosition()
table.setPageOptions([10, 15, 20])
table.registerLoader(async (page, params) => {
    const pageData = {
        pageIndex: page.index,
        pageSize: page.size,
        data: params
    }
    const res = await api.getPage(pageData)
    return res.code === 0 ? res.data : []
})
table.setColumn('id', '查看')
    .enablePer('look')
    .setAttr({ frozen: true, alignFrozen: 'left' })
    .setStyle({ color: 'red' })
    .setWidth('20rem')
    .setTemplate((item) => {
        return {
            component: Button,
            content: '查看',
            props: {
                severity: 'info',
                variant: 'text',
                onClick: () => {}
            }
        }
    })
```
---

## filter（表格筛选，useConfig 中提供的）

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册筛选字段，返回字段对象，可链式设置属性, label 字段选填      |
| `registerBuildDataFunc`   | 筛选数据重写函数，此函数优先级高于全局 $layoutkitBuildDataFunc 方法      |

#### 返回对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `setAttr(attrs: object)`         | 设置字段的属性（label、placeholder、style 等）       |
| `setOptions(options: Array)`     | 设置下拉选项，自动切换为 SELECT 类型       |
| `setType(type: FilterEnum)` | 设置字段类型，参考包中 FilterEnum 枚举       |
| `setDefaultValue(val: any)`      | 设置默认值, 同时设置值, 重置时生效         |
| `setValue(val: any)`             | 设置值                  |
| `setOperator(operator: FilterOperatorEnum)`  | 设置查询操作符，参考包中 FilterOperatorEnum 枚举              |
| `setPlaceholder(text: string)`   | 设置输入提示                 |
| `onRequire()`   | 开启筛选必须输入验证                 |


#### 代码参考
```js
filter.register('name', '姓名')
  .setType(FilterEnum.TEXT)
  .setPlaceholder('请输入姓名')
```

## toolbar（页面工具栏，useConfig 中提供的）

提供顶部工具栏按钮注册和操作

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册工具栏按钮，返回按钮对象，可链式设置属性, label 字段选填      |
| `registerKey`            | 注册权限对象     |

#### 返回对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `enablePer(id: string)`     | 设置工具栏中按钮是否使用权限控制       |
| `ignorePer()`                | 设置工具栏中按钮是否忽略权限控制       |
| `setAttr(attrs: object)`     | 设置工具栏中按钮的属性（如 type、icon 等）       |
| `enableMultiple()`           | 开启多选模式（配合表格多选使用）       |
| `enableSingle()`             | 开启单选模式（配合表格单选使用）       |
| `on(val: func)`              | 事件函数         |


#### 代码参考

```js
toolbar.register('新增')
  .setAttr({ type: 'success', icon: 'Plus' })
  .enablePer('add')
  .on(() => {
    console.log('点击新增')
  })
```

---

## tablebar（表格工具栏，useConfig 中提供的） 或者 useTableBar

提供表格行内工具栏按钮注册和操作

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册按钮，返回按钮对象，可链式设置属性, label 字段选填      |
| `registerKey`             | 注册权限对象     |
| `enableForzen`           | 启用悬停     |
| `setAttr`                 | 设置属性     |
| `setTitle`                | 设置标题     |
| `setWidth`                | 设置宽      |
| `setStyle`                | 设置 style     |

#### 返回字段对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `enablePer(id: string)`     | 设置工具栏中按钮是否使用权限控制       |
| `ignorePer()`                | 设置工具栏中按钮是否忽略权限控制       |
| `setAttr(attrs: object)`     | 设置工具栏中按钮的属性       |
| `hide(val: func)`            | 隐藏事件函数         |
| `on(val: func)`              | 事件函数         |

#### 代码参考

```js
tablebar.register('编辑')
  .setAttr({ type: 'primary', icon: 'Edit' })
  .enablePer('edit')
  .hide((item) => item.status === 1)
  .on(() => {
    console.log('点击编辑')
  })
```

---

## dialog（弹窗管理，useConfig 中提供的） 或者 useDialog

注册一个弹窗实例，返回链式操作对象

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register(title)`             | 注册 dialog 对象，可链式设置属性，title 为默认标题（可省略）      |

#### 返回对象方法

| 方法 |  说明 |
|------|------|
| `setTitle(title)` | 设置标题 |
| `setWidth(width)` | 设置宽 |
| `setStyle(style)` | 设置 style |
| `setContentStyle(style)`              | 设置内容区 style |
| `setAttr(attrs)`                      | 批量设置属性，如 width、fullscreen、draggable、modal、maximizable 等 |
| `setComponent(comp, propsData)`       | 设置弹窗组件及 propsData，支持异步（propsData 可为 function） |
| `setForm(propsData)`                  | 设置表单，等价于 setComponent('form', propsData)，配合 setFormData 使用 |
| `setFormData(propsData)`              | 设置表单字段数据，支持异步调用（可为 function） |
| `show()`                              | 显示弹窗并设置 dialog.instance |
| `hide()`                              | 隐藏弹窗 |
| `destroy()`                           | 销毁弹窗，清空数据，重置 loading |
| `disableCancel()`                    | 禁用取消按钮 |
| `disableCancelIcon()`                | 禁用取消按钮图标 |
| `enableMaximizable()`                | 启用最大化按钮 |
| `setBtn(callback)`                    | 添加或覆盖按钮，callback 接收按钮 api |

#### setBtn

```js
setBtn((btn) => {
  btn.setLabel('保存')   // 设置名称
      .setIcon('pi pi-check')  // 设置图标
      .setType('primary')  // 设置按钮类型
      .on(async (dialogRef, compRef) => {
          // dialogRef.hide() 隐藏弹窗
          // compRef 为当前内容组件实例（如表单组件，可通过 compRef.formData / compRef.valid() 操作）
      })
})
```

#### 代码参考

```js
// 创建表单，参考下节表单相关内容
const useForm = form.register()
useForm.setRow()
    .setColumn('name', col => col.setLabel('姓名').onRequire())
    .setColumn('age', col => col.setLabel('年龄').setType(FormEnum.INPUT_NUMBER))

const myDialog = dialog.register()
  .setAttr({ width: '600px', fullscreen: false, draggable: true })
  .setBtn((btn) => {
      btn.setLabel('保存')
         .setType('primary')
         .on(async (dialogRef, compRef) => {
            try {
                await compRef.valid()               // 表单验证
                await api.saveUser(compRef.formData) // 提交数据
                dialogRef.hide()
            } catch (e) {
                console.log('表单校验未通过', e)
            }
         })
  })
  .setForm(useForm)
// 新增示例
myDialog.setTitle('新增用户').setFormData({ name: '', age: 0 }).show()
// 编辑示例
myDialog.setTitle('用户信息').setFormData({ name: '张三', age: 21 }).show()
```

---

## form（表单管理，useConfig 中提供的） 或者 useForm

用于创建表单对象，或者配合 dialog 使用

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册 form 对象，可链式设置属性      |

#### 返回对象方法

| 方法 |  说明 |
|------|------|
| `setData(formData)` | 设置表单数据 |
| `setRow()` | 创建行，返回行对象 |
| `updateAttr(data)` | 批量更新表单字段属性（field -> attrs） |
| `clone(data)` | 克隆一份新的表单数据 |
| `data` | 表单响应式数据对象 |
| `config` | 表单字段配置数组 |

#### setRow

| 方法 |  说明 |
|------|------|
| `setColumn(field: string, callback: function, label: string)` | 创建列 |

#### callback
| 方法 |  说明 |
|------|------|
| `disableLabel()` | 隐藏表单标题 |
| `setLabel(label: string)` | 设置标题 |
| `setOptions(options: array, type: FormEnum)` | 设置下拉组件的选项数据, type：默认值是 FormEnum.SELECT |
| `setType(type: FormEnum)` | 设置组件类型，详细参考 FormEnum 枚举 |
| `setPlaceholder(text: string)`              | 设置提示语 |
| `setAttr(attrs: object)`                      | 批量设置属性 |
| `setComponent(comp: object)`       | 设置自定义组件，可与 FormItemSlot 插槽配合使用 |
| `setRule(rules: function)` | 设置表单验证规则，function 可接收 schema、z、formData 参数 |
| `onRequire()`              | 启用表单必填验证 |
| `on(fn: function)`                              | 表单组件事件 |
| `hide(fn: function)`                              | 组件隐藏事件 |
| `change(fn: function)`                           | 改变组件的行为 |

#### 代码参考

  ```js
  const options = [{label:'男', value:'M'}, {label:'女', value:'F'}]
  const testForm = form.register()
  testForm.setRow()
      .setColumn('name', col => col.setLabel('姓名')
        .setPlaceholder('请输入姓名')
        .onRequire())
      .setColumn('gender', col => col.setLabel('性别')
        .setType(FormEnum.SELECT)
        .setOptions(options))
  ```

---

## key（权限注册管理，由 useConfig 提供）

用于权限验证

### 方法

| 方法                           | 说明       |
| ---------------------------- | -------- |
| `register(key: string, value: string)`    | 注册权限 key |
| `get(key: string)`                | 获取权限 key |


#### 代码参考

  ```js

  # 注册权限
  key.register('view', 'menu:view')
  # 工具栏使用权限
  toolbar.register('预览').enablePer('view').on(()=> {})

  ```

---

## message（消息提示与确认弹窗，useConfig 中提供的） 或者 useMessage

### 消息提示

```js

message.success(content: string, callback: function)
message.error(content: string, callback: function)
message.info(content: string, callback: function)
message.warning(content: string, callback: function)
message.confirm(content: string, acceptFunc: function, rejectFunc: function, callback: function)

```

`callback` 回调中可链式调用：`setTitle`、`setLife`、`setSeverity`、`setPosition`（confirm 额外支持 `setAcceptProps`、`setRejectProps`、`setIcon`）。

### 使用示例

```js
message.confirm('确定删除吗？', () => {
    // 确认后的逻辑
}, () => {
    // 取消后的逻辑
})
message.success('操作完成', (api) => api.setLife(2000))
```

---

## layout（布局状态管理，useLayout）

管理全局布局状态（主题色、菜单模式、深浅色等），需配合 Layout 模板使用。为模块级单例，任意组件调用 `useLayout()` 获取的都是同一份共享状态。

| 方法名               | 描述                                     |
| -------------------- | -------------------------------------- |
| `toggleMenu()`       | 切换菜单展开 / 收起 |
| `setActiveMenu(item)`| 设置当前激活菜单项 |
| `toggleDarkMode()`   | 切换深色 / 浅色主题（支持 startViewTransition 过渡） |
| `enableOutSide()`    | 点击外部时关闭侧边栏 |
| `updateMenuMode(mode)` | 更新菜单模式，`'static'` 静态 / `'overlay'` 覆盖 |
| `updateColors(color)`  | 更新主题色（如 `'emerald'`、`'indigo'`） |
| `isPrimary(color)`   | 判断颜色是否为当前主题色 |
| `getPresetExt()`     | 获取主题扩展配置（semantic / colorScheme），内部用于切换主题 |
| `loadConfig()`       | 从 localStorage 重新读取布局配置 |

#### 状态属性（只读 / computed）

| 属性               | 描述                          |
| ------------------ | --------------------------- |
| `activeMenu`       | 当前激活的菜单项 |
| `containerClass`   | 布局容器 class 对象（根据 menuMode 等计算，可直接绑定 `:class`） |
| `isSidebarActive`  | 侧边栏是否激活（overlay / mobile） |
| `isDarkTheme`      | 是否深色主题 |
| `getPrimary`       | 当前主题色 |
| `getSurface`       | 当前 surface |
| `getMenuMode`      | 当前菜单模式 |
| `primaryColors`    | 全部主题色选项列表 |

#### 代码参考

```js
const layout = useLayout()

// 切换主题色
layout.updateColors('indigo')
layout.isPrimary('indigo') // true

// 切换菜单模式（static / overlay）
layout.updateMenuMode('overlay')

// 切换深色主题
layout.toggleDarkMode()

// 点击外部关闭侧边栏
layout.enableOutSide()

// 模板中使用
// :class="layout.containerClass"  布局容器样式绑定
// v-if="layout.isDarkTheme"       深色主题判断
// v-for="item in layout.primaryColors" 主题色选择
```

---

## tabStore（多标签页状态管理，useTabStore）

管理页面多标签页状态（新增、切换、关闭标签等），常用于后台管理系统中路由与标签页联动。同样为模块级单例，全局共享状态。

| 方法名                 | 描述                                     |
| ---------------------- | -------------------------------------- |
| `add(tab)`             | 新增标签并自动切换激活，`path: '/'` 的标签不会加入标签列表 |
| `change(path)`         | 切换到指定标签路径 |
| `remove(path)`         | 关闭指定标签；关闭当前激活标签时自动切换到最后一个标签 |
| `removeOther()`        | 关闭除当前激活标签外的其他标签 |
| `removeAll()`          | 关闭全部标签，激活路径回到 `'/'` |
| `registerRemoveHook(func)` | 注册关闭标签时的回调函数（如清理 iframe 标签等） |

#### 状态属性（只读）

| 属性           | 描述                          |
| -------------- | --------------------------- |
| `tabs`         | 标签列表（元素结构示例：`{ path, name, title }`） |
| `activePath`   | 当前激活的标签路径 |

#### 代码参考

```js
const tabStore = useTabStore()

// 路由守卫中新增标签
tabStore.add({
    path: route.fullPath,
    name: route.name,
    title: route.query.title || route.meta.title || '未命名'
})

// 切换标签
tabStore.change('/user/list')

// 关闭标签
tabStore.remove('/user/list')
// 关闭其他 / 全部
tabStore.removeOther()
tabStore.removeAll()

// 注册关闭钩子（iframe 场景清理）
tabStore.registerRemoveHook((path) => {
    // 清理 iframe 缓存等
})

// 模板中渲染标签
// <Tag v-for="tab in tabStore.tabs" :active="tab.path === tabStore.activePath">...
```

---

## 枚举对象

### FormEnum

```ts
FormEnum = {
  INPUT_TEXT: 'input_text',
    INPUT_NUMBER: 'input_number',
    INPUT_TEXTAREA: 'input_textarea',
    DATE_PICKER: 'date_picker',
    TIME_PICKER: 'time_picker',
    RADIO_BUTTON: 'radio_button',
    CHECKBOX: 'checkbox',
    TOGGLE_BUTTON: 'toggle_button',
    SELECT: 'select',
    TREE_SELECT: 'tree_select',
    MULTI_SELECT: 'multi_select',
    PASSWORD: 'password',
    COMPONENT: 'component'
}
```

### FilterEnum

```ts
FilterEnum = {
    TEXT: 'text',
    NUMBER: 'number',
    SELECT: 'select',
    DATE: 'date',
    DATE_RANGE: 'daterange',
    SWITCH: 'switch',
}
```

### FilterOperatorEnum

```ts
FilterOperatorEnum = {
  EQUAL: "=",              // 等于
  NOT_EQUAL: "!=",         // 不等于
  GREATER: ">",            // 大于
  LESS: "<",               // 小于
  GREATER_EQUAL: ">=",     // 大于等于
  LESS_EQUAL: "<=",        // 小于等于
  IS_NULL: "isNull",       // IS NULL
  IS_NOT_NULL: "isNotNull",// IS NOT NULL
  LIKE: "like",            // LIKE
  NOT_LIKE: "notLike",     // NOT LIKE
  IN: "in",                // IN
  NOT_IN: "notIn",         // NOT IN
  OR: "or",                // OR
}
```

---

# 参考示例

```vue
<template>
    <div>
        <PageRender />
        <!--表格列示例-->
        <ColumnItemSlot name="name1">
          <template #default="{ props, data }">
            <!--如果传入的是 props 属性，如下-->
            <Tag severity="info" v-if="data === 0">男</Tag>
            <!--如果传入的是 content 属性，如下-->
            <Tag severity="success" v-if="data === 1">女</Tag>
          </template>
        </ColumnItemSlot>
        <!--表单项示例-->
        <FormItemSlot name="name2">
          <!--emit：其中包含 update 更新方法-->
          <!--props：表单字段属性-->
          <!--data：表单数据-->
          <template #default="{ data, props, emit }">
            <Select v-model="data.gender"
              @change="(e) => emit('update', data.gender)">
              <Option label="男" value="0" />
              <Option label="女" value="1" />
            </Select>
          </template>
        </FormItemSlot>
        <!--Dialog 显示内容示例-->
        <DialogContentSlot name="name3">
            <template #default="{ data }">
              <span>测试</span>
              <span>{{data.content}}</span>
            </template>
        </DialogContentSlot>
    </div>
</template>

<script setup>
  import {
    PageRender, useConfig, FormEnum, FilterEnum,
    DialogContentSlot, FormItemSlot, ColumnItemSlot
  } from '@layoutkit/prime-vue-layoutkit'
  const { table, tablebar, filter, toolbar, form, dialog, message, key } = useConfig()

  // 注册权限
  key.register('view', 'test:view')

  // 注册表单
  const userForm = form.register()
  userForm.setRow()
    .setColumn('name', col => col.setLabel('姓名'))
    .setColumn('age', col => col.setLabel('年龄').setType(FormEnum.INPUT_NUMBER).onRequire())
  // 插槽示例
  userForm.setRow()
    .setColumn('gender', col => col.setLabel('性别').setComponent('name2'))

  // 筛选部分
  filter.register('name', '姓名')
  filter.register('age', '年龄').setType(FilterEnum.NUMBER)

  // dialog
  const userDialog = dialog.register()
              .setAttr({ width: '600px' })
              .setBtn((btn) => {
                btn.setLabel('保存').setType('primary').on(async (currentDialog, componentRef) => {
                    try {
                        // 表单验证
                        await componentRef.valid()
                        // 调用接口
                        const formData = componentRef.formData
                        formData.id
                          ? await api.addUser(componentRef.formData)
                          : await api.updateUser(componentRef.formData)
                        currentDialog.hide()
                        message.success('保存成功')
                        table.reload()
                    } catch (e) {
                        console.log('表单校验未通过', e)
                    }
                })
              })
              .setForm(userForm)

  // 工具栏
  toolbar.register('添加').enablePer('view').setAttr({ type: 'success' }).on(() => {
      userForm.setData({ name: '', age: 0 })
      userDialog.setTitle('添加用户').setForm(userForm).setFormData({ name: '', age: 0 }).show()
  })

  // 工具栏，测试 dialog 内容插槽
  toolbar.register('测试dialog内容插槽').on(() => {
      dialog.register('测试dialog内容插槽').setComponent('name3', { content: '测试内容' }).show()
  })

  // 表格工具栏
  tablebar.register('编辑').on((item) => {
      userForm.setData(item)
      userDialog.setTitle('编辑用户').setForm(userForm).setFormData(item).show()
  })

  // 表格列与加载
  table.setColumn('name', '姓名')
  table.setColumn('age', '年龄')
  table.setColumn('gender', '性别').setTemplate((item) => {
    return {
      component: 'name1',
      content: item.gender,
      props: {
        gender: item.gender
      }
    }
  })
  table.registerLoader(async (page, params) => {
    const res = await api.getUsers({
        pageNum: page.index,
        pageSize: page.size,
        data: params
    })
    return { records: res.list, total: res.total }
  })
</script>
```
---
