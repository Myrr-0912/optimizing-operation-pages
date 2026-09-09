import React, { useMemo, useState } from 'react'
import {
  Alert, App, Badge, Button, ConfigProvider, DatePicker, Dropdown, Empty, Input,
  Select, Skeleton, Space, Table, Tag, theme, Tooltip, Typography
} from 'antd'
import { DownOutlined, ReloadOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import {
  STATUS_TEXT, STATUS_COLOR, RISK_TEXT, RISK_COLOR, PAY_TEXT, CHANNEL_TEXT,
  CHANNEL_OPTIONS, PAY_OPTIONS
} from '../../shared/constants.js'
import { fmtMoney, fmtDate, fmtDateTime } from '../../shared/format.js'
import { useOrders, filterOrders, activeFilterTags, EMPTY_FILTERS } from '../../shared/useOrders.js'
import { useOrderActions } from '../../shared/useOrderActions.js'
import { OrderDescriptions } from '../../shared/OrderDescriptions.jsx'
import { ScenarioBar } from '../../shared/ScenarioBar.jsx'

const { RangePicker } = DatePicker
const DICTS = { STATUS_TEXT, CHANNEL_TEXT, PAY_TEXT, RISK_TEXT }
const STATUS_DOT = {
  WAIT_PAY: '#fbbf24', PAID: '#60a5fa', SHIPPED: '#22d3ee',
  FINISHED: '#34d399', CLOSED: '#6b7280', REFUNDING: '#f87171'
}

function Kpi({ label, value, tone, active, onClick, mono = true }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, cursor: onClick ? 'pointer' : 'default', padding: '14px 18px',
        background: '#171a21', borderRadius: 8,
        border: `1px solid ${active ? tone : '#262b36'}`,
        boxShadow: active ? `0 0 0 1px ${tone}` : 'none', transition: 'border-color .15s'
      }}
    >
      <div style={{ color: '#8b93a7', fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{
        color: tone, fontSize: 26, fontWeight: 600, lineHeight: 1,
        fontFamily: mono ? "'JetBrains Mono', Consolas, monospace" : undefined,
        fontVariantNumeric: 'tabular-nums'
      }}>
        {value}
      </div>
    </div>
  )
}

function CommandPage({ scenario }) {
  const { rows, setRows, loading, error, reload } = useOrders(scenario)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [current, setCurrent] = useState(null)
  const actions = useOrderActions({ setRows, setSelectedKeys, reload })

  const filtered = useMemo(() => filterOrders(rows, filters), [rows, filters])
  const setF = (patch) => setFilters((prev) => ({ ...prev, ...patch }))
  const clearAll = () => setFilters(EMPTY_FILTERS)
  const tags = activeFilterTags(filters, DICTS)

  const kpi = useMemo(() => ({
    total: rows.length,
    waitPay: rows.filter((r) => r.status === 'WAIT_PAY').length,
    refunding: rows.filter((r) => r.status === 'REFUNDING').length,
    highRisk: rows.filter((r) => r.riskLevel === 'HIGH').length,
    gmv: rows.reduce((s, r) => s + r.amount, 0)
  }), [rows])

  const currentRow = current && filtered.find((r) => r.id === current.id) ? current : current
  const columns = [
    {
      title: '订单号', dataIndex: 'orderNo', width: 150, fixed: 'left',
      render: (v, row) => (
        <span style={{ fontFamily: "Consolas, monospace", color: '#7dd3fc', cursor: 'pointer' }} onClick={() => setCurrent(row)}>
          {v}
        </span>
      )
    },
    {
      title: '状态', dataIndex: 'status', width: 92,
      render: (v) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <Badge color={STATUS_DOT[v]} /> <span style={{ color: '#cdd3e1' }}>{STATUS_TEXT[v]}</span>
        </span>
      )
    },
    {
      title: '风险', dataIndex: 'riskLevel', width: 86,
      render: (v) => v === 'HIGH'
        ? <Tag color="red" icon={<WarningOutlined />} style={{ marginInlineEnd: 0 }}>高</Tag>
        : v === 'MID'
          ? <Tag color="orange" style={{ marginInlineEnd: 0 }}>中</Tag>
          : <span style={{ color: '#5b6372' }}>低</span>
    },
    {
      title: '客户', dataIndex: 'customerName', width: 120,
      render: (v, row) => <Tooltip title={row.customerPhone}><span style={{ color: '#cdd3e1' }}>{v}</span></Tooltip>
    },
    {
      title: '金额', dataIndex: 'amount', width: 110, align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => <span style={{ fontFamily: 'Consolas, monospace', color: '#e6e8ee' }}>{fmtMoney(v)}</span>
    },
    {
      title: '渠道/支付', width: 110,
      render: (_, row) => <span style={{ color: '#8b93a7' }}>{CHANNEL_TEXT[row.channel]} · {PAY_TEXT[row.payType]}</span>
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 105, defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <Tooltip title={fmtDateTime(v)}><span style={{ color: '#8b93a7', fontFamily: 'Consolas, monospace' }}>{fmtDate(v)}</span></Tooltip>
    },
    {
      title: '操作', key: 'action', width: 130, fixed: 'right',
      render: (_, row) => (
        <Space size={2}>
          <Button size="small" type="link" style={{ padding: '0 4px' }} onClick={() => setCurrent(row)}>详情</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'remind', label: '催发货', disabled: row.status !== 'PAID' },
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '拉黑客户', danger: true },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'remind') actions.remindShip(row)
                if (key === 'copy') actions.copyOrderNo(row)
                if (key === 'blacklist') actions.blacklist(row)
                if (key === 'delete') { actions.deleteOrder(row); if (current?.id === row.id) setCurrent(null) }
              }
            }}
          >
            <Button size="small" type="link" style={{ padding: '0 4px' }}>更多 <DownOutlined style={{ fontSize: 10 }} /></Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ background: '#0f1115', minHeight: '100vh', padding: '16px 20px 72px' }}>
      <style>{`
        .cc-risk-high td:first-child { box-shadow: inset 3px 0 0 #f87171; }
        .cc-row:hover td { background: #1d2330 !important; }
        .cc-selected td { background: #1a2233 !important; }
      `}</style>

      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ color: '#e6e8ee', fontSize: 16, fontWeight: 600 }}>
          订单处理台 <span style={{ color: '#5b6372', fontSize: 12, fontWeight: 400, marginLeft: 8 }}>ORDER OPS</span>
        </span>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => actions.exportAll(filtered.length)}>导出全部</Button>
          <Button icon={<ReloadOutlined />} onClick={actions.syncErp}>同步 ERP</Button>
        </Space>
      </div>

      {/* KPI 行（可点击过滤） */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <Kpi label="全部订单" value={loading ? '—' : kpi.total} tone="#e6e8ee"
          active={!filters.status && !filters.riskLevel} onClick={() => setF({ status: undefined, riskLevel: undefined })} />
        <Kpi label="待支付" value={loading ? '—' : kpi.waitPay} tone="#fbbf24"
          active={filters.status === 'WAIT_PAY'} onClick={() => setF({ status: 'WAIT_PAY', riskLevel: undefined })} />
        <Kpi label="退款中" value={loading ? '—' : kpi.refunding} tone="#f87171"
          active={filters.status === 'REFUNDING'} onClick={() => setF({ status: 'REFUNDING', riskLevel: undefined })} />
        <Kpi label="高风险" value={loading ? '—' : kpi.highRisk} tone="#fb7185"
          active={filters.riskLevel === 'HIGH'} onClick={() => setF({ riskLevel: 'HIGH', status: undefined })} />
        <Kpi label="GMV（元）" value={loading ? '—' : fmtMoney(kpi.gmv)} tone="#34d399" />
      </div>

      {/* 工具条 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <Input.Search allowClear placeholder="订单号 / 交易号 / 客户 / 手机号" style={{ width: 280 }}
          value={filters.keyword} onChange={(e) => setF({ keyword: e.target.value })} />
        <RangePicker value={filters.dateRange} onChange={(v) => setF({ dateRange: v })} />
        <Select allowClear placeholder="渠道" style={{ width: 100 }} value={filters.channel}
          onChange={(v) => setF({ channel: v })} options={CHANNEL_OPTIONS} />
        <Select allowClear placeholder="支付" style={{ width: 100 }} value={filters.payType}
          onChange={(v) => setF({ payType: v })} options={PAY_OPTIONS} />
        {tags.length > 0 && <Button type="link" onClick={clearAll}>清空筛选（{tags.length}）</Button>}
        <span style={{ marginLeft: 'auto', color: '#5b6372', fontSize: 12 }}>命中 {loading ? '—' : filtered.length} / {rows.length} 条</span>
      </div>

      {/* 错误横幅 */}
      {error && (
        <Alert banner type="error" style={{ marginBottom: 10, borderRadius: 8 }}
          message={`订单流获取失败：${error}`}
          action={<Button size="small" danger onClick={reload}>重试</Button>} />
      )}

      {/* 分栏工作台：左表格 + 右详情侧栏 */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, background: '#171a21', border: '1px solid #262b36', borderRadius: 8, padding: 12 }}>
          {loading ? (
            <Skeleton active title={false} paragraph={{ rows: 12, width: '100%' }} />
          ) : (
            <Table
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={filtered}
              scroll={{ x: 900 }}
              onRow={(row) => ({ onClick: () => setCurrent(row) })}
              rowClassName={(row) =>
                ['cc-row', row.riskLevel === 'HIGH' ? 'cc-risk-high' : '', current?.id === row.id ? 'cc-selected' : ''].join(' ')
              }
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
              pagination={{ pageSize: 15, size: 'small', showTotal: (t) => `共 ${t} 条` }}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      tags.length > 0
                        ? '当前筛选下没有订单——可能是条件过窄'
                        : '订单流为空：当前没有需要处理的订单'
                    }>
                    {tags.length > 0 && <Button size="small" type="primary" onClick={clearAll}>清空筛选</Button>}
                  </Empty>
                )
              }}
            />
          )}
        </div>

        {/* 右侧详情侧栏 */}
        <div style={{
          width: 340, flexShrink: 0, position: 'sticky', top: 16,
          background: '#171a21', border: '1px solid #262b36', borderRadius: 8, padding: 16
        }}>
          {currentRow ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Typography.Text strong style={{ fontSize: 14 }}>订单详情</Typography.Text>
                <Tag color={STATUS_COLOR[currentRow.status]}>{STATUS_TEXT[currentRow.status]}</Tag>
              </div>
              <OrderDescriptions order={currentRow} column={1} />
              <Space style={{ marginTop: 14 }} wrap>
                <Button type="primary" size="small" disabled={currentRow.status !== 'PAID'} onClick={() => actions.remindShip(currentRow)}>
                  催发货
                </Button>
                <Button size="small" onClick={() => actions.copyOrderNo(currentRow)}>复制订单号</Button>
                <Button size="small" danger onClick={() => actions.blacklist(currentRow)}>拉黑</Button>
              </Space>
            </>
          ) : (
            <div style={{ color: '#5b6372', textAlign: 'center', padding: '48px 0' }}>
              点击左侧任意行<br />在此查看完整字段与快捷操作
            </div>
          )}
        </div>
      </div>

      {/* 浮出式批量操作条 */}
      {selectedKeys.length > 0 && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 14, padding: '10px 20px',
          background: '#1d2330', border: '1px solid #2f3648', borderRadius: 999,
          boxShadow: '0 8px 24px rgba(0,0,0,.5)'
        }}>
          <span style={{ color: '#e6e8ee', fontSize: 13 }}>已选 <b style={{ color: '#7dd3fc' }}>{selectedKeys.length}</b> 笔</span>
          <Button size="small" danger onClick={() => actions.batchClose(selectedKeys, rows)}>批量关闭</Button>
          <Button size="small" type="text" onClick={() => setSelectedKeys([])}>清空选择</Button>
        </div>
      )}
    </div>
  )
}

export default function CommandCenter() {
  const [scenario, setScenario] = useState('normal')
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          borderRadius: 8, fontSize: 13, colorPrimary: '#13c2c2',
          colorBgLayout: '#0f1115', colorBgContainer: '#171a21', colorBorderSecondary: '#262b36'
        }
      }}
    >
      <App>
        <ScenarioBar value={scenario} onChange={setScenario} />
        <CommandPage scenario={scenario} />
      </App>
    </ConfigProvider>
  )
}
