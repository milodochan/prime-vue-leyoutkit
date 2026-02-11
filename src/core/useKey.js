import { readonly, ref } from 'vue'

export function useKey() {
    const _per_key_config = ref({})
    const key = {
        permission: readonly(_per_key_config.value),
        register: (key, value) => {
            _per_key_config.value[key] = value
        },
        get: (key) => _per_key_config.value[key]
    }

    return key
}