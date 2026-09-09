import React from 'react'

// 预览专用的“演示场景”切换条（左下角悬浮），用于触达 正常/空/错误 三种数据状态。
// 加载态在每次切换/刷新时自然出现；成功态通过页面内操作（批量关闭、导出等）触达。
const SCENARIOS = [
  { id: 'normal', label: '正常数据' },
  { id: 'empty', label: '空数据' },
  { id: 'error', label: '接口错误' }
]

export default function ScenarioBar({ scenario, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'rgba(30,30,30,.92)',
        borderRadius: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,.3)',
        fontSize: 12,
        color: '#bbb'
      }}
    >
      <span>演示场景</span>
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          style={{
            border: 'none',
            cursor: 'pointer',
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 13,
            background: s.id === scenario ? '#fff' : 'transparent',
            color: s.id === scenario ? '#111' : '#eee'
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
