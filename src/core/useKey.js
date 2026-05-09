export function useKey() {
    let keys = []
    const register = (key, value) => {
        keys[key] = value
    }
    const get = (key) => keys[key]
    return {
        register, get
    }
}