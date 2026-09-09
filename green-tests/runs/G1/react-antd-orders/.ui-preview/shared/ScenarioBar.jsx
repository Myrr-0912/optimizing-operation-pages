import React from 'react'

const SCENARIOS = [
  { id: 'normal', label: '正常' },
  { id: 'loading', label: '加载中' },
  { id: 'empty', label: '空数据' },
  { id: 'error', label: '加载失败' }
]

/**
 * 预览专用"演示状态"切换器（固定于顶部右侧，不属于方案本身的 UI）。
 * 成功态请通过页面操作触达：批量关闭 / 导出 / 催发货 等均有成功反馈。
 */
export function ScenarioBar({ value, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 12,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        borderRadius: 999,
        background: 'rgba(30,30,30,.88)',
        boxShadow: '0 2px 10px rgba(0,0,0,.25)',
        fontSize: 12
      }}
    >
      <span style={{ color: '#bbb', marginRight: 2 }}>演示状态</span>
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          style={{
            border: 'none',
            cursor: 'pointer',
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 12,
            background: value === s.id ? '#fff' : 'transparent',
            color: value === s.id ? '#111' : '#ddd'
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
