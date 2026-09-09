import React from 'react'

const OPTIONS = [
  { key: 'normal', label: '正常' },
  { key: 'slow', label: '加载中' },
  { key: 'empty', label: '空数据' },
  { key: 'error', label: '接口错误' }
]

/** 左下角演示状态切换条（预览专用，不属于方案本身）。成功态通过实际执行操作（催发货/批量关闭/导出）触达。 */
export default function ScenarioBar({ scenario, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'rgba(30,30,30,.92)',
        borderRadius: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,.3)',
        fontSize: 12,
        color: '#bbb'
      }}
    >
      <span style={{ padding: '0 2px' }}>演示状态</span>
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={{
            border: 'none',
            cursor: 'pointer',
            borderRadius: 999,
            padding: '3px 10px',
            fontSize: 12,
            background: scenario === o.key ? '#fff' : 'transparent',
            color: scenario === o.key ? '#111' : '#ddd'
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
