import React, { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Input,
  Select,
  Skeleton,
  Space,
  Switch,
  Table,
  theme,
  Typography
} from 'antd'
import { DownOutlined, ReloadOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import {
  CHANNELS,
  PAY_TEXT,
  PAY_TYPES,
  RISK_COLOR,
  RISK_TEXT,
  STATUS_TEXT
} from '../../mock/orders'
import { fmtDateTime, fmtMoney } from '../../shared/format'
import { applyFilters, useOrders } from '../../shared/useOrders'
import { useOrderActions } from '../../shared/useOrderActions'
import OrderDetailDrawer from '../../shared/OrderDetailDrawer'
import ScenarioBar from '../../shared/ScenarioBar'

const { RangePicker } = DatePicker
const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace"

// 深色下状态点颜色（对比度足够的亮色系）
const STATUS_DOT = {
  WAIT_PAY: '#fbbf24',
  PAID: '#60a5fa',
  SHIPPED: '#818cf8',
  FINISHED: '#34d399',
  CLOSED: '#6b7280',
  REFUNDING: '#f87171'
}

const EMPTY_FILTERS = {
  keyword: '',
  status: undefined,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined,
  dateRange: null
}

const CSS = `
.cc-root .ant-table-tbody > tr.cc-alt > td { background: #14171e; }
.cc-root .ant-table-tbody > tr.cc-risk-high > td:first-child { box-shadow: inset 3px 0 0 #f87171; }
.cc-root .ant-table-tbody > tr.cc-risk-mid > td:first-child { box-shadow: inset 3px 0 0 #fbbf24; }
.cc-kpi { cursor: pointer; border: 1px solid #262b36; border-radius: 8px; padding: 14px 18px;
  background: #171a21; flex: 1; min-width: 150px; transition: border-color .15s, box-shadow .15s; }
.cc-kpi:hover { border-color: #2dd4bf66; }
.cc-kpi.cc-kpi-active { border-color: #2dd4bf; box-shadow: 0 0 0 1px #2dd4bf40, 0 0 18px #2dd4bf22; }
.cc-kpi.cc-kpi-static { cursor: default; }
.cc-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; }
`

function Kpi({ label, value, sub, active, onClick, color, isStatic }) {
  return (
    <div
      className={`cc-kpi ${active ? 'cc-kpi-active' : ''} ${isStatic ? 'cc-kpi-static' : ''}`}
      onClick={isStatic ? undefined : onClick}
      role={isStatic ? undefined : 'button'}
    >
      <div style={{ fontSize: 12, color: '#8b93a3', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, fontFamily: MONO, color: color || '#e6e8ee', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function CommandPage() {
  const { rows, setRows, loading, error, scenario, setScenario, reload } = useOrders()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [kpi, setKpi] = useState('ALL') // ALL | WAIT_PAY | REFUNDING | HIGH_RISK
  const [riskFirst, setRiskFirst] = useState(true)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)
  const actions = useOrderActions({ rows, setRows, selectedKeys, setSelectedKeys })

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))

  const effective = useMemo(() => {
    const f = { ...filters }
    if (kpi === 'WAIT_PAY') f.status = 'WAIT_PAY'
    if (kpi === 'REFUNDING') f.status = 'REFUNDING'
    if (kpi === 'HIGH_RISK') f.riskLevel = 'HIGH'
    return f
  }, [filters, kpi])

  const filtered = useMemo(() => {
    const list = applyFilters(rows, effective, dayjs)
    if (!riskFirst) return list
    const rank = { HIGH: 0, MID: 1, LOW: 2 }
    return [...list].sort((a, b) => rank[a.riskLevel] - rank[b.riskLevel])
  }, [rows, effective, riskFirst])

  const stats = useMemo(
    () => ({
      total: rows.length,
      waitPay: rows.filter((r) => r.status === 'WAIT_PAY').length,
      refunding: rows.filter((r) => r.status === 'REFUNDING').length,
      highRisk: rows.filter((r) => r.riskLevel === 'HIGH').length,
      amount: rows.reduce((s, r) => s + r.amount, 0)
    }),
    [rows]
  )

  const hasFilters =
    kpi !== 'ALL' ||
    !!filters.keyword ||
    !!filters.status ||
    !!filters.channel ||
    !!filters.payType ||
    !!filters.riskLevel ||
    !!(filters.dateRange && (filters.dateRange[0] || filters.dateRange[1]))

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 145,
      fixed: 'left',
      render: (v, row) => (
        <Typography.Link onClick={() => setDetail(row)} style={{ fontFamily: MONO, fontSize: 12.5 }}>
          {v}
        </Typography.Link>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 150,
      render: (v, row) => (
        <span>
          {v} <span style={{ color: '#6b7280', fontSize: 12, fontFamily: MONO }}>{row.customerPhone}</span>
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => <span style={{ fontFamily: MONO }}>{fmtMoney(v)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 95,
      render: (v) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          <span className="cc-dot" style={{ background: STATUS_DOT[v], boxShadow: `0 0 6px ${STATUS_DOT[v]}` }} />
          {STATUS_TEXT[v]}
        </span>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 70,
      render: (v) => (
        <span style={{ color: v === 'LOW' ? '#6b7280' : RISK_COLOR[v], fontSize: 12 }}>{RISK_TEXT[v]}</span>
      )
    },
    {
      title: '渠道/支付',
      dataIndex: 'channel',
      width: 105,
      render: (v, row) => (
        <span style={{ color: '#8b93a3', fontSize: 12 }}>
          {v}·{PAY_TEXT[row.payType]}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 135,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <span style={{ color: '#8b93a3', fontSize: 12, fontFamily: MONO }}>{fmtDateTime(v)}</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 165,
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          <Button size="small" type="link" onClick={() => actions.urgeShip(row)}>
            催发货
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '加入黑名单', danger: true },
                { key: 'remove', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') actions.copyOrder(row)
                if (key === 'blacklist') actions.blacklist(row)
                if (key === 'remove') actions.removeOrder(row)
              }
            }}
          >
            <Button size="small" type="link">
              更多 <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div className="cc-root" style={{ background: '#0f1115', minHeight: '100vh', padding: '16px 20px 96px' }}>
      <style>{CSS}</style>

      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e6e8ee' }}>订单管理</h2>
        <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280' }}>实时值守 · 模拟数据</span>
        <Space style={{ marginLeft: 'auto' }}>
          <Button size="small" icon={<ReloadOutlined />} onClick={reload}>
            刷新
          </Button>
          <Button size="small" onClick={actions.syncErp}>
            同步 ERP
          </Button>
          <Button size="small" onClick={() => actions.exportAll(filtered.length)}>
            导出
          </Button>
        </Space>
      </div>

      {/* KPI 行：点击即筛选 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <Kpi label="全部订单" value={loading ? '—' : stats.total} active={kpi === 'ALL'} onClick={() => setKpi('ALL')} />
        <Kpi
          label="待支付"
          value={loading ? '—' : stats.waitPay}
          color="#fbbf24"
          active={kpi === 'WAIT_PAY'}
          onClick={() => setKpi(kpi === 'WAIT_PAY' ? 'ALL' : 'WAIT_PAY')}
          sub="点击过滤"
        />
        <Kpi
          label="退款中"
          value={loading ? '—' : stats.refunding}
          color="#f87171"
          active={kpi === 'REFUNDING'}
          onClick={() => setKpi(kpi === 'REFUNDING' ? 'ALL' : 'REFUNDING')}
          sub="点击过滤"
        />
        <Kpi
          label="高风险"
          value={loading ? '—' : stats.highRisk}
          color="#f87171"
          active={kpi === 'HIGH_RISK'}
          onClick={() => setKpi(kpi === 'HIGH_RISK' ? 'ALL' : 'HIGH_RISK')}
          sub="点击过滤"
        />
        <Kpi label="订单总额" value={loading ? '—' : `¥${fmtMoney(stats.amount)}`} isStatic sub="全部订单合计" />
      </div>

      {/* 补充筛选工具条 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <Input
          size="small"
          placeholder="订单号 / 交易号 / 客户 / 手机号"
          allowClear
          style={{ width: 240 }}
          value={filters.keyword}
          onChange={(e) => set({ keyword: e.target.value })}
        />
        <Select
          size="small"
          placeholder="状态"
          allowClear
          style={{ width: 100 }}
          value={filters.status}
          onChange={(v) => set({ status: v })}
          options={Object.keys(STATUS_TEXT).map((k) => ({ value: k, label: STATUS_TEXT[k] }))}
        />
        <Select
          size="small"
          placeholder="渠道"
          allowClear
          style={{ width: 90 }}
          value={filters.channel}
          onChange={(v) => set({ channel: v })}
          options={CHANNELS.map((v) => ({ value: v, label: v }))}
        />
        <Select
          size="small"
          placeholder="支付"
          allowClear
          style={{ width: 100 }}
          value={filters.payType}
          onChange={(v) => set({ payType: v })}
          options={PAY_TYPES.map((v) => ({ value: v, label: PAY_TEXT[v] }))}
        />
        <RangePicker size="small" value={filters.dateRange} onChange={(v) => set({ dateRange: v })} />
        <span style={{ fontSize: 12, color: '#8b93a3', marginLeft: 4 }}>
          异常置顶 <Switch size="small" checked={riskFirst} onChange={setRiskFirst} />
        </span>
        {hasFilters && (
          <Button
            size="small"
            type="link"
            onClick={() => {
              setFilters(EMPTY_FILTERS)
              setKpi('ALL')
            }}
          >
            清空条件
          </Button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8b93a3', fontFamily: MONO }}>
          {filtered.length} / {rows.length}
        </span>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          banner
          style={{ marginBottom: 12, border: '1px solid #f8717155', borderRadius: 6 }}
          message="订单流加载失败"
          description={error}
          action={
            <Button size="small" danger onClick={reload}>
              重试
            </Button>
          }
        />
      )}

      {/* 明细表 */}
      <div style={{ border: '1px solid #262b36', borderRadius: 8, overflow: 'hidden', background: '#171a21' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            <Skeleton active title={false} paragraph={{ rows: 9, width: '100%' }} />
          </div>
        ) : (
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={error ? [] : filtered}
            scroll={{ x: 1080 }}
            sticky
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            rowClassName={(row, i) =>
              [
                i % 2 === 1 ? 'cc-alt' : '',
                row.riskLevel === 'HIGH' ? 'cc-risk-high' : row.riskLevel === 'MID' ? 'cc-risk-mid' : ''
              ]
                .filter(Boolean)
                .join(' ')
            }
            locale={{
              emptyText: (
                <div style={{ padding: '40px 0', color: '#8b93a3' }}>
                  {error ? (
                    '加载失败，请点击上方「重试」'
                  ) : hasFilters ? (
                    <>
                      当前条件下没有订单——若在盯异常，这可能是好消息；也可能是筛选过窄。
                      <div style={{ marginTop: 12 }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setFilters(EMPTY_FILTERS)
                            setKpi('ALL')
                          }}
                        >
                          清空筛选
                        </Button>
                      </div>
                    </>
                  ) : (
                    '暂无订单流入'
                  )}
                </div>
              )
            }}
            pagination={{ pageSize: 15, size: 'small', showTotal: (t) => `共 ${t} 条` }}
          />
        )}
      </div>

      {/* 浮出式批量操作条 */}
      {selectedKeys.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 20,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#1c212b',
            border: '1px solid #2dd4bf55',
            borderRadius: 10,
            padding: '10px 18px',
            boxShadow: '0 8px 28px rgba(0,0,0,.5)'
          }}
        >
          <span style={{ color: '#e6e8ee', fontSize: 13 }}>
            已选 <b style={{ fontFamily: MONO }}>{selectedKeys.length}</b> 笔订单
          </span>
          <Button danger size="small" onClick={actions.batchClose}>
            批量关闭
          </Button>
          <Button size="small" type="text" onClick={() => setSelectedKeys([])}>
            取消
          </Button>
        </div>
      )}

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

export default function CommandCenterVariant() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#2dd4bf',
          borderRadius: 6,
          fontSize: 13,
          colorBgBase: '#0f1115',
          colorBgContainer: '#171a21',
          colorBgElevated: '#1c212b',
          colorBorder: '#2c3340',
          colorBorderSecondary: '#262b36',
          colorText: '#e6e8ee',
          colorTextSecondary: '#8b93a3'
        }
      }}
    >
      <App>
        <CommandPage />
      </App>
    </ConfigProvider>
  )
}
