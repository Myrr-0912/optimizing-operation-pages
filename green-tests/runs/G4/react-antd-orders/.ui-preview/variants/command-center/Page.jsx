import React, { useMemo, useState } from 'react'
import {
  App as AntApp,
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Select,
  Skeleton,
  Space,
  Table,
  Typography,
  theme
} from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useOrders } from '../../shared/useOrders.js'
import { filterOrders, hasActiveFilters } from '../../shared/filters.js'
import ScenarioBar from '../../shared/ScenarioBar.jsx'
import OrderDetailDrawer from '../../shared/OrderDetailDrawer.jsx'
import {
  STATUS_TEXT,
  STATUS_DOT,
  PAY_TEXT,
  CHANNEL_TEXT,
  CHANNEL_OPTIONS,
  PAY_OPTIONS,
  fmtAmount,
  fmtDateTime,
  maskPhone
} from '../../shared/dict.js'
import { urgeShip, copyOrderNo, confirmDelete, confirmBlacklist, confirmBatchClose, exportAll, syncErp } from '../../shared/actions.js'

const { RangePicker } = DatePicker
const MONO = 'Consolas, "SF Mono", Menlo, monospace'

const EMPTY_FILTERS = {
  keyword: '',
  status: undefined,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined,
  dateRange: null
}

function KpiCard({ title, value, tone = '#e6e8ee', hint, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 150,
        cursor: onClick ? 'pointer' : 'default',
        background: '#171a21',
        border: `1px solid ${active ? tone : '#262b36'}`,
        borderRadius: 8,
        padding: '14px 16px',
        boxShadow: active ? `0 0 0 1px ${tone} inset` : 'none'
      }}
    >
      <div style={{ fontSize: 12, color: '#8b93a7', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 26, lineHeight: 1.1, color: tone, fontFamily: MONO }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: '#5c6474', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

function CommandPageInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, error, scenario, setScenario, reload } = useOrders()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => filterOrders(data, filters), [data, filters])
  const patch = (p) => setFilters((f) => ({ ...f, ...p }))
  const clearFilters = () => setFilters(EMPTY_FILTERS)
  const filtering = hasActiveFilters(filters)

  const kpi = useMemo(
    () => ({
      total: data.length,
      waitPay: data.filter((r) => r.status === 'WAIT_PAY').length,
      refunding: data.filter((r) => r.status === 'REFUNDING').length,
      highRisk: data.filter((r) => r.riskLevel === 'HIGH').length,
      gmv: data.reduce((s, r) => s + r.amount, 0)
    }),
    [data]
  )

  const kpiFilter = (p) => {
    setFilters({ ...EMPTY_FILTERS, keyword: filters.keyword, ...p })
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 150,
      fixed: 'left',
      render: (v, row) => (
        <Typography.Link onClick={() => setDetail(row)} style={{ fontFamily: MONO }}>
          {v}
        </Typography.Link>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => (
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: 99,
              background: STATUS_DOT[v],
              marginRight: 6,
              boxShadow: `0 0 6px ${STATUS_DOT[v]}`
            }}
          />
          {STATUS_TEXT[v]}
        </span>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 84,
      render: (v) =>
        v === 'HIGH' ? (
          <span style={{ color: '#ff6b6b', fontWeight: 600 }}>高危</span>
        ) : v === 'MID' ? (
          <span style={{ color: '#f5c518' }}>中</span>
        ) : (
          <span style={{ color: '#5c6474' }}>低</span>
        )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 150,
      render: (v, row) => (
        <span>
          {v} <span style={{ color: '#5c6474', fontSize: 12 }}>{maskPhone(row.customerPhone)}</span>
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      render: (v) => <span style={{ fontFamily: MONO }}>{fmtAmount(v)}</span>
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 150,
      render: (v, row) => (
        <span style={{ color: '#aeb6c8' }}>
          {CHANNEL_TEXT[v] || v} · {PAY_TEXT[row.payType] || row.payType}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 140,
      render: (v) => <span style={{ fontFamily: MONO, color: '#aeb6c8' }}>{fmtDateTime(v)}</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 168,
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          <Button size="small" type="link" onClick={() => urgeShip(message, row)}>
            催发货
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '加入黑名单', danger: true },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') copyOrderNo(message, row)
                if (key === 'blacklist') confirmBlacklist(modal, message, row)
                if (key === 'delete')
                  confirmDelete(modal, message, row, () => setData((d) => d.filter((x) => x.id !== row.id)))
              }
            }}
          >
            <Button size="small" type="link">
              更多 ▾
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f1115', padding: '16px 20px 88px 20px' }}>
      <style>{`
        .cc-risk-high > td:first-child { box-shadow: inset 3px 0 0 #e5484d; }
        .cc-table .ant-table { background: #12151b; }
      `}</style>

      {/* 页头 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#e6e8ee' }}>订单管理 · 值守台</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#5c6474' }}>数据每次刷新时拉取（预览为模拟数据）</span>
        </div>
        <Space>
          <Button onClick={reload}>刷新</Button>
          <Button onClick={() => syncErp(message)}>同步 ERP</Button>
          <Button type="primary" onClick={() => exportAll(message, filtered.length)}>
            导出全部
          </Button>
        </Space>
      </div>

      {/* KPI 行：点击即过滤 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <KpiCard
          title="全部订单"
          value={loading ? '…' : kpi.total}
          active={!filters.status && !filters.riskLevel}
          onClick={() => kpiFilter({})}
          hint="点击清除状态/风险过滤"
        />
        <KpiCard
          title="待支付"
          value={loading ? '…' : kpi.waitPay}
          tone="#f5c518"
          active={filters.status === 'WAIT_PAY'}
          onClick={() => kpiFilter({ status: 'WAIT_PAY' })}
          hint="超时未付可批量关闭"
        />
        <KpiCard
          title="退款中"
          value={loading ? '…' : kpi.refunding}
          tone="#ff7452"
          active={filters.status === 'REFUNDING'}
          onClick={() => kpiFilter({ status: 'REFUNDING' })}
          hint="需要今日跟进"
        />
        <KpiCard
          title="高风险"
          value={loading ? '…' : kpi.highRisk}
          tone="#ff6b6b"
          active={filters.riskLevel === 'HIGH'}
          onClick={() => kpiFilter({ riskLevel: 'HIGH' })}
          hint="风控标记，优先复核"
        />
        <KpiCard title="订单总额" value={loading ? '…' : fmtAmount(kpi.gmv)} tone="#3ecf8e" hint="当前数据集合计" />
      </div>

      {/* 工具条 */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#171a21',
          border: '1px solid #262b36',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 12
        }}
      >
        <Input
          allowClear
          placeholder="订单号 / 交易号 / 客户 / 手机号"
          style={{ width: 250 }}
          value={filters.keyword}
          onChange={(e) => patch({ keyword: e.target.value })}
        />
        <Select
          allowClear
          placeholder="渠道"
          style={{ width: 120 }}
          value={filters.channel}
          onChange={(v) => patch({ channel: v })}
          options={CHANNEL_OPTIONS}
        />
        <Select
          allowClear
          placeholder="支付方式"
          style={{ width: 130 }}
          value={filters.payType}
          onChange={(v) => patch({ payType: v })}
          options={PAY_OPTIONS}
        />
        <RangePicker value={filters.dateRange} onChange={(v) => patch({ dateRange: v })} />
        {filtering && (
          <Button type="link" onClick={clearFilters}>
            清空条件
          </Button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8b93a7' }}>
          {filtering ? `命中 ${filtered.length} / ${data.length}` : `共 ${data.length} 条`}
        </span>
      </div>

      {/* 数据区 */}
      {error ? (
        <Alert
          type="error"
          showIcon
          message="订单数据加载失败"
          description={error}
          action={
            <Button size="small" danger onClick={reload}>
              重试
            </Button>
          }
        />
      ) : loading ? (
        <div style={{ background: '#171a21', border: '1px solid #262b36', borderRadius: 8, padding: 16 }}>
          <Skeleton active title={false} paragraph={{ rows: 10, width: '100%' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: '#171a21',
            border: '1px solid #262b36',
            borderRadius: 8,
            padding: '56px 0',
            textAlign: 'center'
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              filtering ? '当前筛选条件下没有订单——可能筛得太窄了' : '当前没有订单数据，这可能是个好消息'
            }
          >
            {filtering && <Button onClick={clearFilters}>清空筛选</Button>}
          </Empty>
        </div>
      ) : (
        <div className="cc-table">
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1120 }}
            rowClassName={(row) => (row.riskLevel === 'HIGH' ? 'cc-risk-high' : '')}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          />
        </div>
      )}

      {/* 浮出式批量操作条 */}
      {selectedKeys.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 20,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#171a21',
            border: '1px solid #3b4354',
            borderRadius: 10,
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,.5)',
            color: '#e6e8ee'
          }}
        >
          <span style={{ fontSize: 13 }}>
            已选 <b style={{ fontFamily: MONO }}>{selectedKeys.length}</b> 笔订单
          </span>
          <Button
            danger
            onClick={() =>
              confirmBatchClose(modal, message, selectedKeys.length, () => {
                setData((d) => d.map((x) => (selectedKeys.includes(x.id) ? { ...x, status: 'CLOSED' } : x)))
                setSelectedKeys([])
              })
            }
          >
            批量关闭
          </Button>
          <Button onClick={() => setSelectedKeys([])}>取消选择</Button>
        </div>
      )}

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

// 风格包 command-center：darkAlgorithm、KPI 即筛选、高对比状态色、等宽数字
export default function CommandCenterPage() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#0f1115',
          colorBgContainer: '#171a21',
          colorBorder: '#2c3240',
          colorBorderSecondary: '#232834',
          colorText: '#e6e8ee',
          colorTextSecondary: '#aeb6c8',
          borderRadius: 6,
          fontSize: 13
        }
      }}
    >
      <AntApp>
        <CommandPageInner />
      </AntApp>
    </ConfigProvider>
  )
}
