import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'PrimeVueLayoutKit',
      fileName: (format) => `prime-vue-layoutkit.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'primevue', 'primeicons'],
      output: {
        globals: {
          vue: 'Vue',
          'primevue': 'PrimeVue',
          'primeicons': 'PrimeIcons'
        }
      }
    },
    cssCodeSplit: true
  }
})