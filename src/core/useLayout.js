import { updatePreset } from '@primeuix/themes'
import { computed, readonly, ref, watch } from 'vue'
import { semanticNoir, colorScheme, primaryColors } from '../data/index'

const CONFIG_STORAGE_KEY = 'app-layout-config'

const preset = ref('Aura')
const primary = ref('emerald')
const menuMode = ref('static')
const darkTheme = ref(false)
const toolbarMode = ref(false)
const surface = ref(null)

const staticMenuDesktopInactive = ref(false)
const overlayMenuActive = ref(false)
const profileSidebarVisible = ref(false)
const configSidebarVisible = ref(false)
const staticMenuMobileActive = ref(false)
const menuHoverActive = ref(false)
const activeMenu = ref(null)

// 保存配置到 localStorage
const saveConfig = () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
        darkTheme: darkTheme.value,
        menuMode: menuMode.value,
        primary: primary.value,
        toolbarMode: toolbarMode.value
    }))
}

// 从 localStorage 读取配置
const loadConfig = () => {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY)
    if (stored) {
        try {
            const parsed = JSON.parse(stored)
            if (typeof parsed.darkTheme === 'boolean') {
                darkTheme.value = parsed.darkTheme
                if (parsed.darkTheme)
                    document.documentElement.classList.add('app-dark')
            }
            if (typeof parsed.menuMode === 'string')
                menuMode.value = parsed.menuMode
            if (typeof parsed.primary === 'string')
                primary.value = parsed.primary
            if (typeof parsed.primary === 'string')
                toolbarMode.value = parsed.toolbarMode
        } catch (err) {
            console.warn('layout config parse error:', err)
        }
    }
}

const getPresetExt = () => {
    const color = primaryColors.find((c) => c.name === primary.value)
    return {
        semantic: color?.name === 'noir'
            ? semanticNoir
            : {
                primary: color.palette,
                colorScheme: colorScheme
            }
    }
}

const isSidebarActive = computed(() => overlayMenuActive.value || staticMenuMobileActive.value)
const isDarkTheme = computed(() => darkTheme.value)
const getPrimary = computed(() => primary.value)
const getSurface = computed(() => surface.value)
const getMenuMode = computed(() => menuMode.value)
const containerClass = computed(() => {
    // 系统刷新后让主题生效
    surface.value = 'neutral'
    return {
        'layout-overlay': menuMode.value === 'overlay',
        'layout-static': menuMode.value === 'static',
        'layout-static-inactive': staticMenuDesktopInactive.value && menuMode.value === 'static',
        'layout-overlay-active': overlayMenuActive.value,
        'layout-mobile-active': staticMenuMobileActive.value
    }
})
const setActiveMenu = (item) => activeMenu.value = item.value || item
const executeDarkModeToggle = () => {
    darkTheme.value = !darkTheme.value
    document.documentElement.classList.toggle('app-dark')
}
const toggleDarkMode = () => {
    if (!document.startViewTransition) {
        executeDarkModeToggle()
        return
    }

    document.startViewTransition(() => executeDarkModeToggle())
}
const toggleMenu = () => {
    if (menuMode.value === 'overlay')
        overlayMenuActive.value = !overlayMenuActive.value

    if (window.innerWidth > 991)
        staticMenuDesktopInactive.value = !staticMenuDesktopInactive.value
    else
        staticMenuMobileActive.value = !staticMenuMobileActive.value
}
const enableOutSide = () => {
    overlayMenuActive.value = false
    staticMenuMobileActive.value = false
    menuHoverActive.value = false
}
const updateMenuMode = async (mode) => {
    const isOverlay = mode === 'overlay'
    if (window.innerWidth > 991)
        staticMenuDesktopInactive.value = isOverlay
    else
        staticMenuMobileActive.value = isOverlay

    if (isOverlay) {
        const tick = setInterval(() => {
            menuMode.value = mode
            clearInterval(tick)
        }, 200)
    } else menuMode.value = mode
}
const updateColors = (color) => primary.value = color
const isPrimary = (color) => primary.value === color

// 监听 layoutConfig 中的部分字段
watch(
    () => [
        primary.value,
        darkTheme.value,
        menuMode.value,
        toolbarMode.value
    ],
    ([primary], [oldPrimary]) => {
        saveConfig()

        if (primary !== oldPrimary) {
            updatePreset(getPresetExt())
        }
    }
)

// 加载主题
loadConfig()

export const useLayout = () => ({
    loadConfig,
    toggleMenu,
    setActiveMenu,
    toggleDarkMode,
    getPresetExt,
    enableOutSide,
    updateMenuMode,
    updateColors,
    isPrimary,
    activeMenu: readonly(activeMenu),
    containerClass,
    isSidebarActive,
    isDarkTheme,
    getPrimary,
    getSurface,
    getMenuMode,
    primaryColors
})
