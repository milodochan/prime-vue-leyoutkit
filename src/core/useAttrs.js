import { reactive } from 'vue'

export function useDialogAttrs() {
    return reactive({
        header: null,
        footer: null,
        // visible: false,
        modal: false,
        contentStyle: null,
        contentClass: null,
        contentProps: null,
        closable: true,
        dismissableMask: false,
        closeOnEscape: true,
        showHeader: true,
        blockScroll: false,
        baseZIndex: 0,
        autoZIndex: true,
        position: "center",
        maximizable: false,
        breakpoints: null,
        draggable: true,
        keepInViewport: true,
        minX: 0,
        minY: 0,
        appendTo: "body",
        style: null,
        closeIcon: null,
        maximizeIcon: null,
        minimizeIcon: null,
        //closeButtonProps: null,
        //maximizeButtonProps: null,
        dt: null,
        pt: null,
        //ptOptions: null,
        // unstyled: false
    })
}