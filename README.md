# @layoutkit/prime-vue-layoutkit

`@layoutkit/prime-vue-layoutkit` 是一个基于prime-vue ui的工厂函数，用于生成页面基础配置对象，提供表格、表单、对话框、工具栏、消息提示等功能，常用于后台管理系统页面。

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
| `PageRender`        | 页面级布局组件，用于表格 + 工具栏 + 分页等场景 |
| `LayoutTable`       | 表格组件，根据配置自动渲染表格         |
| `LayoutForm`        | 动态表单组件，根据配置自动渲染表单项         |
| `DialogContentSlot` | Dialog 内容插槽扩展组件            |
| `FormItemSlot`      | 表单项插槽扩展组件                  |
| `ColumnItemSlot`    | 表格列插槽扩展组件                  |
| `LayoutMessage`     | 消息组件                  |

使用方式：
```
import { ColumnItemSlot, PageRender } from '@layoutkit/prime-vue-layoutkit'
```

消息及弹窗使用方式：
``` js
# 在App.vue中新增，如下
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
| `useConfig`     | const { table, dialog, form, tablebar, toolbar, message，key } = useConfig()  | 配合PageRander使用，集成了所有hooks，具体api参考其他hooks  |
| `useDialog`     | const dialog = useDialog()      | 弹窗 |
| `useForm`       | const form = useForm()          | 表单         |
| `useTable`      | const table = useTable()        | 表格         |
| `useTableBar`   | const tablebar = useTableBar()  | 表格工具栏            |
| `useMessage`    | const message = useMessage()    | 消息                  |

## 三、枚举类型（Enums）
| 枚举                     | 作用                                     |
| ---------------------- | -------------------------------------- |
| `FilterEnum`         | 页面筛选器类型（input / select / date 等）       |
| `FilterOperatorEnum` | 筛选器操作符（=、like、between 等）               |
| `FormEnum`           | 表单项类型定义（input、textarea、select、radio 等） |

示例：
```js
import { FormEnum } from '@layoutkit/prime-vue-layoutkit'

if (field.type === FormEnum.SELECT) { ... }
```


# 快速开始（Usage）

* 需要在项目中使用权限管理相关设置，如下代码所示。
```js
import { store as storePer } from '@layoutkit/prime-vue-layoutkit'
# 此处数据存储到localStorage中，如需sessionStorage, 请调用storePer.enabledSession(), 更多使用参考store相关内容。
async getPermission() {
    try {
        const res = await api.getPermission()
        if (res.code === 0) {
            this.menus = res.data.menus.sort((a, b) => a.sort - b.sort)
            this.permissions = res.data.pers
            this.userInfo = res.data.userInfo
            if (res.data.super) storePer.disabledPer()  // 超管不验证权限
            else {
                storePer.set(res.data.pers)             // 将权限数据传递给权限控制模块
                storePer.enabledPer()                   // 启用权限控制   
            }
        }
        return res
    } catch (error) {
        this.menus = []
        throw error
    }
}
```

* PageRender组件中的筛选功能
```js
# PageRender组件中的筛选相关功能默认数据格式为普通json对象，如需其他数据格式需要使用如下方法重写
app.config.globalProperties.$layoutkitBuildDataFunc = (items) => { return items }

# items数据结构如下
[{
  field: '',              // 字段名
  fieldOperator: '=',     // 查询类型
  value: ''               // 查询值
}]
```

---

# API 文档（API）

## useTable, 或者useConfig中提供的table

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `registerLoader`          | 注册表格加载函数，需返回数据格式： { total: 0, records: [] } , 树形表格返回[]即可       |
| `setPageSize`             | 设置分页大小 |
| `setPageOptions`          | 设置分页选项 |
| `setRowKey`               | 数据行的字段 |
| `setParentKey`            | 树结构表格数据行的父级字段 |
| `disabledDefaultCloumn`   | 禁用默认列 |
| `enabledTree`             | 启用树结构表格 |
| `enabledLeftPosition`     | 启用左侧工具栏，默认右侧 |
| `disabledPagination`      | 禁用分页组件 |
| `reload`                  | 重新加载表格，并将分页页码重置为 1 |
| `registerKey`             | 注册权限对象 |
| `setColumn`               | 表格列函数，详细参考下面表格               |

### setColumn
| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `enabledPer`          | 设置列是否使用权限控制      |
| `setTemplate`         | 重写列的内容，支持返回一般内容以及使用组件返回 |
| `setWidth`            | 设置列的宽度 |
| `setStyle`            | 设置列的样式 |
| `setAttr`             | 设置列的属性 |


### 代码参考
``` js
table.enabledLeftPosition()
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
    .enabledPer('look')
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

## filter（表格筛选, useConfig中提供的）

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册筛选字段，返回字段对象，可链式设置属性, label字段选填      |
| `registerBuildDataFunc`   | 筛选数据重写函数，此函数优先级高于全局$layoutkitBuildDataFunc方法      |

#### 返回对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `setOptions(options: Array)`     | 设置下拉选项，自动切换为 SELECT 类型       |
| `setType(type: FilterEnum)` | 设置字段类型，参考包中FilterEnum枚举       |
| `setDefaultValue(val: any)`      | 设置默认值, 同时设置值, 重置时生效         |
| `setValue(val: any)`             | 设置值                  |
| `setOperator(operator: FilterOperatorEnum)`  | 设置查询操作符，参考包中FilterOperatorEnum枚举              |
| `setPlaceholder(text: string)`   | 设置输入提示                 |
| `onRequire()`   | 开启筛选必须输入验证                 |


#### 代码参考
```js
filter.register('name', '姓名')
  .setType(FilterEnum.TEXT)
  .setPlaceholder('请输入姓名')
```

## toolbar（页面工具栏, useConfig中提供的）

提供顶部工具栏注册和操作

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册筛选字段，返回字段对象，可链式设置属性, label字段选填      |
| `registerKey`            | 注册权限对象     |

#### 返回对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `enabledPer(id: string)`     | 设置工具中按钮是否使用权限控制       |
| `setAttr(attrs: object)`     | 设置工具中按钮的属性       |
| `on(val: func)`              | 事件函数         |


#### 代码参考

```js
toolbar.register('新增')
  .setAttr({ type: 'success', icon: 'Plus' })
  .enabledPer('add')
  .on(() => {
    console.log('点击新增')
  })
```

---

## 4. tablebar（表格工具栏, useConfig中提供的） 或者useTableBar

提供表格中的工具栏按钮注册和操作

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册按钮，返回按钮对象，可链式设置属性, label字段选填      |
| `registerKey`             | 注册权限对象     |
| `enabledForzen`           | 启用悬停     |
| `setAttr`                 | 设置属性     |
| `setTitle`                | 设置标题     |
| `setWidth`                | 设置宽      |
| `setStyle`                | 设置style     |

#### 返回字段对象方法

| 方法                               | 说明                     |
| -------------------------------- | ---------------------- |
| `enabledPer(id: string)`     | 设置工具栏中按钮是否使用权限控制       |
| `setAttr(attrs: object)`     | 设置工具栏中按钮的属性       |
| `hide(val: func)`            | 隐藏事件函数         |
| `on(val: func)`              | 事件函数         |

#### 代码参考

```js
tablebar.register('编辑')
  .setAttr({ type: 'primary', icon: 'Edit' })
  .enabledPer('edit')
  .hide((item) => item.status === 1)
  .on(() => {
    console.log('点击新增')
  })
```

---

## 5. dialog（弹窗管理, useConfig中提供的） 或者useDialog

注册一个弹窗实例，返回链式操作对象

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册dialog对象，可链式设置属性      |

#### 返回对象方法

| 方法 |  说明 |
|------|------|
| `setTitle(title)` | 设置标题 |
| `setWidth(width)` | 设置宽 |
| `setStyle(style)` | 设置style |
| `setContentStyle(style)`              | 设置ContentStyle |
| `setAttr(attrs)`                      | 批量设置属性，如 title、width、fullscreen、draggable、withCancel、aliginCenter |
| `setComponent(comp, propsData)`       | 设置弹窗组件及 propsData，支持异步 |
| `setForm(propsData)`                  | useForm返回的表单对象 |
| `setFormData(propsData)`              | 表单的字段对象/支持异步调用的表单数据接口 |
| `show()`                              | 显示弹窗并设置 dialog.instance |
| `hide()`                              | 隐藏弹窗 |
| `destroy()`                           | 销毁弹窗，清空数据，重置 loading |
| `disabledCancel()`                    | 禁用取消按钮 |
| `disabledCancelIcon()`                | 禁用取消按钮图标 |
| `enabledMaximizable()`                | 启用最大化按钮 |
| `setBtn(label, command, type, icon)`  | 添加或覆盖按钮 |

#### setBtn
| 方法 |  说明 |
|------|------|
| `setLabel(label)` | 设置名称 |
| `setIcon(icon)`   | 设置图标 |
| `setType(type)`   | 设置按钮类型 |
| `on(func)`        | 按钮事件 |

#### 代码参考

```js
// 创建，使用表单的话，参考下节表单相关内容
const useForm = form.register()
const myDialog = dialog.register()
  .setAttr({ width: '600px', fullscreen: false, draggable: true })
  .setBtn('保存', async (dialogRef, compRef) => {
      await saveUser(formMap.get('userForm').data)
      dialogRef.hide()
  }, 'primary')
  .setForm(useForm)
// 新增示例
myDialog.setTitle('新增用户').setFormData({ }).show()
// 编辑示例
myDialog.setTitle('用户信息').setFormData({ name: '张三', age: 21 }).show()
```

---

## 6. form（表单管理, useConfig中提供的） 或者useForm

用于创建表单对象，或者配合dialog使用

| 方法名称                     | 描述                                     |
| ---------------------- | -------------------------------------- |
| `register`                | 注册form对象，可链式设置属性      |

#### 返回对象方法

| 方法 |  说明 |
|------|------|
| `setData(formData)` | 设置表单数据 |
| `setRow()` | 创建行，返回行对象 |

#### setRow

| 方法 |  说明 |
|------|------|
| `setColumn(field: string, callback: function, label: string)` | 创建列 |

#### callback
| 方法 |  说明 |
|------|------|
| `disabledLabel()` | 隐藏表单标题 |
| `setLabel(label: string)` | 设置标题 |
| `setOptions(options: array, type: FormEnum)` | 设置部门组件的选项数据, type：默认值是FormEnum.SELECT |
| `setType(type：FormEnum)` | 设置组件类型，详细参考FormEnum枚举 |
| `setPlaceholder(text：string)`              | 设置提示语 |
| `setAttr(attrs：object)`                      | 批量设置属性 |
| `setComponent(comp：object)`       | 设置自定义组件，可与FormItemSlot插槽配合使用 |
| `setRule(rules：function)` | 设置表单验证规则，function可接收 schema、 z 、formData 参数 |
| `onRequire()`              | 启用表单规则验证 |
| `on(fn：function)`                              | 表单组件事件 |
| `hide(fn：function)`                              | 组件隐藏事件 |
| `change(fn：function)`                           | 改变组件的行为 |
| `setColumn(field: string, callback: function, label: string)`                           | 创建列 |

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


## 7. key（权限注册管理，由useConfig提供）

用于权限验证

### 方法

| 方法                           | 说明       |
| ---------------------------- | -------- |
| `register(key：string, value：string)`    | 注册权限 key |
| `get(key：string)`                | 获取权限 key |


#### 代码参考

  ```js

  # 注册权限
  key.register('view', 'menu:view')
  # 工具栏使用权限
  toolbar.register('预览').enabledPer('view').on(()=> {})

  ```

---

## 8. message（消息提示与确认弹窗, useConfig中提供的） 或者useMessage

### 消息提示

```js

message.success(content: string, callback: function)
message.error(content：string, callback: function)
message.info(content：string, callback: function)
message.warning(content：string, callback: function)
message.confirm(content：string, acceptFunc: function, rejectFunc: function, callback: function)

```

### 弹窗提示

```js
await message.confirm('确定删除吗？', () => {})
await message.success('操作完成')
```

---

## 9. 枚举对象

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

```js
<template>
    <div>
        <PageRender />
        <!--表格列示例-->
        <ColumnItemSlot name="name1">
          <template #default="{ props, data }">
            <!--如果传入的是props属性，如下-->
            <el-tag type='info' v-if="data === 0">男</el-tag>
            <!--如果传入的是content属性，如下-->
            <el-tag type='primary' v-if="data === 1">女</el-tag>
          </template>
        </ColumnItemSlot>
        <!--表单项示例-->
        <FormItemSlot name="name2">
          <!--emit：其中包含update更新方法-->
          <!--props：表单字段属性-->
          <!--data：表单数据-->
          <template #default="{ data, props, emit }">
            <el-select v-model="data.gender"
              @change="(e) => emit('update', data.gender)">
              <el-option label="男" value="0" />
              <el-option label="女" value="1" />
          </el-select>
          </template>
        </FormItemSlot>
        <!--Dialog 显示内容示例-->
        <DialogContentSlot name="name3">
            <span>测试</span>
        </DialogContentSlot>
    </div>
</template>

<script setup>
  import {
    PageRender, useConfig, FormEnum,
    DialogContentSlot, FormItemSlot, ColumnItemSlot
  } from '@layoutkit/prime-vue-layoutkit'
  const { table, tablebar, filter, toolbar, form, dialog, message, key } = useConfig()

  // 注册权限
  key.register('view', 'test:view')

  // 注册表单
  const userForm = form.register()
  userForm.setRow()
    .setColumn('name', col => col.setLabel('年龄'))
    .setColumn('age', col => col.setLabel('年龄').setType(FormEnum.INPUT_NUMBER).onRequire())
  // 插槽示例
  userForm.setRow().
    .setColumn('gender', col => col.setLabel('性别').setComponent('name2'))

  // 筛选部分
  filter.register('name', '姓名')
  filter.register('age', '年龄')

  // dialog
  const userDialog = dialog.register()
              .setAttr({ width: '600px' })
              .setBtn('保存', async (currentDialog, componentRef) => {
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
              }, 'primary')

  // 工具栏
  toolbar.register('添加').enabledPer('view').setAttr({ type: 'success' }).on(async () => {
      userForm.setData({ name: '', age: 0 })
      userDialog.setTitle('添加用户').setForm(userForm).show()
  })

  // 工具栏, 测试dialog内容插槽
  toolbar.register('测试dialog内容插槽').on(async () => {
      dialog.register('测试dialog内容插槽').setComponent('name3').show()
  })

  // table工具栏
  tablebar.register('编辑').on((item) => {
      userForm.setData(item)
      userDialog.setTitle('编辑用户').setForm(userForm).show()
  })

  // 表格加载
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
  table.registerLoader(async (pageInfo, pageParams) => {
    const res = await api.getUsers({
        pageNum: page.index,
        pageSize: page.size,
        data: pageParams
    })
    return { records: res.list, total: res.total }
  })
</script>
```
---