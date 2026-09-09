import { createApp, computed, h, ref, watch } from 'vue'
import { variants } from '../variants/index.js'

const storage = {
  get(key) {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value) } catch { /* file:// 等场景忽略 */ }
  }
}

const NAV_STYLE =
  'position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:8px;padding:8px 12px;' +
  'background:rgba(30,30,30,.92);border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,.3)'

const pillStyle = (active) =>
  'border:none;cursor:pointer;border-radius:999px;padding:4px 12px;font-size:13px;' +
  (active ? 'background:#fff;color:#111' : 'background:transparent;color:#eee')

const Shell = {
  setup() {
    const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
    const id = ref(read())
    window.addEventListener('hashchange', () => (id.value = read()))
    const active = computed(() => variants.find((v) => v.id === id.value) || variants[0])
    const go = (next) => (window.location.hash = '#/' + next)

    // 每个方案独立记忆主题色/字体选择；无声明或存储值失效时回退到第一项（默认项）。
    const storageKey = (kind) => `op-preview:${active.value.id}:${kind}`
    const themeId = ref(storage.get(storageKey('theme')))
    const fontId = ref(storage.get(storageKey('font')))
    watch(active, () => {
      themeId.value = storage.get(storageKey('theme'))
      fontId.value = storage.get(storageKey('font'))
    })
    const pick = (kind, refVal, next) => {
      storage.set(storageKey(kind), next)
      refVal.value = next
    }
    const theme = computed(() => {
      const list = active.value.themes || []
      return list.find((t) => t.id === themeId.value) || list[0] || null
    })
    const font = computed(() => {
      const list = active.value.fonts || []
      return list.find((f) => f.id === fontId.value) || list[0] || null
    })

    return () => {
      if (!variants.length) {
        return h('p', { style: 'padding:24px' }, '还没有注册方案：请在 variants/index.js 中导出 variants 数组。')
      }
      const themes = active.value.themes || []
      const fonts = active.value.fonts || []
      const vars = { ...(theme.value && theme.value.vars), ...(font.value && font.value.vars) }
      const divider = () => h('span', { style: 'width:1px;align-self:stretch;background:rgba(255,255,255,.25)' })
      return h('div', [
        h('div', { style: vars }, [h(active.value.component)]),
        h('nav', { style: NAV_STYLE }, [
          ...variants.map((v) =>
            h('button', { onClick: () => go(v.id), style: pillStyle(v.id === active.value.id) }, v.title)
          ),
          ...(themes.length ? [divider()] : []),
          ...themes.map((t) =>
            h('button', {
              title: t.title,
              onClick: () => pick('theme', themeId, t.id),
              style:
                'width:16px;height:16px;padding:0;cursor:pointer;border-radius:50%;' +
                `background:${t.vars['--op-primary']};` +
                (theme.value && theme.value.id === t.id ? 'border:2px solid #fff' : 'border:2px solid transparent')
            })
          ),
          ...(fonts.length ? [divider()] : []),
          ...fonts.map((f) =>
            h(
              'button',
              { title: f.title, onClick: () => pick('font', fontId, f.id), style: pillStyle(font.value && font.value.id === f.id) },
              f.title
            )
          )
        ])
      ])
    }
  }
}

createApp(Shell).mount('#app')
