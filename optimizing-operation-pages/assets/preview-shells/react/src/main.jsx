import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { variants } from '../variants/index.jsx'

function useHashVariant() {
  const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
  const [id, setId] = useState(read)
  useEffect(() => {
    const onHash = () => setId(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [id, (next) => (window.location.hash = '#/' + next)]
}

const storage = {
  get(key) {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value) } catch { /* file:// 等场景忽略 */ }
  }
}

// 每个方案独立记忆主题色/字体选择；无声明或存储值失效时回退到第一项（默认项）。
function usePickedOption(variantId, kind, options) {
  const key = `op-preview:${variantId}:${kind}`
  const [id, setId] = useState(() => storage.get(key))
  useEffect(() => setId(storage.get(key)), [key])
  const picked = options.find((o) => o.id === id) || options[0] || null
  return [picked, (next) => { storage.set(key, next); setId(next) }]
}

const pillBtn = (active) => ({
  border: 'none',
  cursor: 'pointer',
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 13,
  background: active ? '#fff' : 'transparent',
  color: active ? '#111' : '#eee'
})

function Shell() {
  const [id, go] = useHashVariant()
  if (!variants.length) {
    return <p style={{ padding: 24 }}>还没有注册方案：请在 variants/index.jsx 中导出 variants 数组。</p>
  }
  const active = variants.find((v) => v.id === id) || variants[0]
  const Active = active.component
  const themes = active.themes || []
  const fonts = active.fonts || []
  const [theme, pickTheme] = usePickedOption(active.id, 'theme', themes)
  const [font, pickFont] = usePickedOption(active.id, 'font', fonts)
  const vars = { ...(theme && theme.vars), ...(font && font.vars) }
  const divider = <span style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.25)' }} />
  return (
    <>
      <div style={vars}>
        <Active />
      </div>
      <nav
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(30,30,30,.92)',
          borderRadius: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,.3)'
        }}
      >
        {variants.map((v) => (
          <button key={v.id} onClick={() => go(v.id)} style={pillBtn(v.id === active.id)}>
            {v.title}
          </button>
        ))}
        {themes.length > 0 && divider}
        {themes.map((t) => (
          <button
            key={t.id}
            title={t.title}
            onClick={() => pickTheme(t.id)}
            style={{
              width: 16,
              height: 16,
              padding: 0,
              cursor: 'pointer',
              borderRadius: '50%',
              background: t.vars['--op-primary'],
              border: theme && theme.id === t.id ? '2px solid #fff' : '2px solid transparent'
            }}
          />
        ))}
        {fonts.length > 0 && divider}
        {fonts.map((f) => (
          <button key={f.id} title={f.title} onClick={() => pickFont(f.id)} style={pillBtn(font && font.id === f.id)}>
            {f.title}
          </button>
        ))}
      </nav>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Shell />)
