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

function Shell() {
  const [id, go] = useHashVariant()
  if (!variants.length) {
    return <p style={{ padding: 24 }}>还没有注册方案：请在 variants/index.jsx 中导出 variants 数组。</p>
  }
  const active = variants.find((v) => v.id === id) || variants[0]
  const Active = active.component
  return (
    <>
      <Active />
      <nav
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 9999,
          display: 'flex',
          gap: 8,
          padding: '8px 12px',
          background: 'rgba(30,30,30,.92)',
          borderRadius: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,.3)'
        }}
      >
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => go(v.id)}
            style={{
              border: 'none',
              cursor: 'pointer',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 13,
              background: v.id === active.id ? '#fff' : 'transparent',
              color: v.id === active.id ? '#111' : '#eee'
            }}
          >
            {v.title}
          </button>
        ))}
      </nav>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Shell />)
