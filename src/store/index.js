import { markRaw, reactive, ref } from 'vue'

const formSlotStore = ref(new Map())
const dialogSlotStore = ref(new Map())
const columnSlotStore = ref(new Map())

/**
 * dialog store
 */
const dialogStore = { list: reactive([]) }

/**
 * registerProvide
 * @param {*} id 
 * @param {*} comp 
 * @returns 
 */
const registerProvide = (id, comp) => {
    if (typeof id !== 'string') {
        console.warn(`[dialog] registerProvide: key 必须为 string，收到:`, id)
        return
    }

    dialogSlotStore.value.set(id, markRaw(comp))
}

export { formSlotStore, dialogSlotStore, columnSlotStore, dialogStore, registerProvide }