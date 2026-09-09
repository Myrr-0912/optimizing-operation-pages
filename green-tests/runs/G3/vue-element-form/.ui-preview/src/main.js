import { createApp, computed, h, ref } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { variants } from '../variants/index.js'

const Shell = {
  setup() {
    const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
    const id = ref(read())
    window.addEventListener('hashchange', () => (id.value = read()))
    const active = computed(() => variants.find((v) => v.id === id.value) || variants[0])
    const go = (next) => (window.location.hash = '#/' + next)

    return () => {
      if (!variants.length) {
        return h('p', { style: 'padding:24px' }, '还没有注册方案：请在 variants/index.js 中导出 variants 数组。')
      }
      return h('div', [
        h(active.value.component, { key: active.value.id }),
        h(
          'nav',
          {
            style:
              'position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;gap:8px;padding:8px 12px;' +
              'background:rgba(30,30,30,.92);border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,.3)'
          },
          variants.map((v) =>
            h(
              'button',
              {
                onClick: () => go(v.id),
                style:
                  'border:none;cursor:pointer;border-radius:999px;padding:4px 12px;font-size:13px;' +
                  (v.id === active.value.id ? 'background:#fff;color:#111' : 'background:transparent;color:#eee')
              },
              v.title
            )
          )
        )
      ])
    }
  }
}

const app = createApp(Shell)
app.use(ElementPlus, { locale: zhCn })
app.mount('#app')
