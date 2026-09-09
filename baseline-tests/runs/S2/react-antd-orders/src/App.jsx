import React, { useEffect, useState } from 'react'
import { ConfigProvider, Segmented } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import OrdersPage from './pages/OrdersPage'
import OrdersPageClassic from './pages/variants/OrdersPageClassic'
import OrdersPageAiry from './pages/variants/OrdersPageAiry'
import OrdersPageDense from './pages/variants/OrdersPageDense'
import OrdersPageDark from './pages/variants/OrdersPageDark'

/**
 * 界面改版方案预览入口。
 * 通过 URL hash 切换（#/original、#/a、#/b、#/c、#/d），
 * 右下角有悬浮切换器。选定方案后，把对应组件设为唯一入口并删除其余即可。
 */
const VARIANTS = [
  { key: 'original', label: '原版', component: OrdersPage, bodyBg: '' },
  { key: 'a', label: 'A 经典专业', component: OrdersPageClassic, bodyBg: '#f0f2f5' },
  { key: 'b', label: 'B 清爽卡片', component: OrdersPageAiry, bodyBg: '#f6f5fb' },
  { key: 'c', label: 'C 高效紧凑', component: OrdersPageDense, bodyBg: '#f5f7fa' },
  { key: 'd', label: 'D 暗色驾驶舱', component: OrdersPageDark, bodyBg: '#0b0f1c' }
]

function getKeyFromHash() {
  const h = window.location.hash.replace(/^#\/?/, '')
  return VARIANTS.some((v) => v.key === h) ? h : 'original'
}

export default function App() {
  const [key, setKey] = useState(getKeyFromHash)

  useEffect(() => {
    const onHash = () => setKey(getKeyFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const variant = VARIANTS.find((v) => v.key === key)

  useEffect(() => {
    // 原版保持浏览器默认 body 边距；新方案自带整页背景，去掉边距
    document.body.style.margin = key === 'original' ? '' : '0'
    document.body.style.background = variant.bodyBg
  }, [key, variant])

  const Current = variant.component

  return (
    <ConfigProvider locale={zhCN}>
      <Current key={key} />
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 2000,
          background: '#fff',
          padding: '8px 10px',
          borderRadius: 12,
          boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
          border: '1px solid #eee'
        }}
      >
        <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>界面方案预览（可用 URL #/a ~ #/d 直达）</div>
        <Segmented
          size="small"
          value={key}
          options={VARIANTS.map((v) => ({ value: v.key, label: v.label }))}
          onChange={(k) => {
            window.location.hash = '/' + k
          }}
        />
      </div>
    </ConfigProvider>
  )
}
