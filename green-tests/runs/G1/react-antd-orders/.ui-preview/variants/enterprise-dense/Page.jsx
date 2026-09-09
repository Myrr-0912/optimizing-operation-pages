import React, { useMemo, useState } from 'react'
import {
  Alert, App, Button, ConfigProvider, DatePicker, Drawer, Dropdown, Empty, Input,
  Popover, Select, Skeleton, Space, Table, Tag, Tooltip, Typography
} from 'antd'
import { DownOutlined, FilterOutlined, MessageOutlined, ReloadOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import {
  STATUS_TEXT, STATUS_COLOR, RISK_TEXT, RISK_COLOR, PAY_TEXT, CHANNEL_TEXT,
  STATUS_OPTIONS, CHANNEL_OPTIONS, PAY_OPTIONS, RISK_OPTIONS
} from '../../shared/constants.js'
import { fmtMoney, fmtDate, fmtDateTime } from '../../shared/format.js'
import { useOrders, filterOrders, activeFilterTags, EMPTY_FILTERS } from '../../shared/useOrders.js'
import { useOrderActions } from '../../shared/useOrderActions.js'
import { OrderDescriptions } from '../../shared/OrderDescriptions.jsx'
import { ScenarioBar } from '../../shared/ScenarioBar.jsx'

const { RangePicker } = DatePicker
const DICTS = { STATUS_TEXT, CHANNEL_TEXT, PAY_TEXT, RISK_TEXT }

function DensePage({ scenario }) {
  const { rows, setRows, loading, error, reload } = useOrders(scenario)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)
  const actions = useOrderActions({ setRows, setSelectedKeys, reload })

  const filtered = useMemo(() => filterOrders(rows, filters), [rows, filters])
  const tags = activeFilterTags(filters, DICTS)
  const setF = (patch) => setFilters((prev) => ({ ...prev, ...patch }))
  const clearAll = () => setFilters(EMPTY_FILTERS)

  const moreFilterContent = (
    <Space direction="vertical" size={8} style={{ width: 220 }}>
      <Select allowClear placeholder="渠道" style={{ width: '100%' }} value={filters.channel}
        onChange={(v) => setF({ channel: v })} options={CHANNEL_OPTIONS} />
      <Select allowClear placeholder="支付方式" style={{ width: '100%' }} value={filters.payType}
        onChange={(v) => setF({ payType: v })} options={PAY_OPTIONS} />
      <Select allowClear placeholder="风险等级" style={{ width: '100%' }} value={filters.riskLevel}
        onChange={(v) => setF({ riskLevel: v })} options={RISK_OPTIONS} />
    </Space>
  )

  const columns = [
    {
      title: '订单号 / 外部交易号', dataIndex: 'orderNo', width: 200, fixed: 'left',
      render: (v, row) => (
        <div>
          <Typography.Link onClick={() => setDetail(row)}>{v}</Typography.Link>
          <div style={{ color: '#999', fontSize: 12 }}>{row.outTradeNo || '—'}</div>
        </div>
      )
    },
    {
      title: '客户', dataIndex: 'customerName', width: 130,
      render: (v, row) => (
        <div>
          {v}
          <div style={{ color: '#999', fontSize: 12 }}>{row.customerPhone}</div>
        </div>
      )
    },
    {
      title: '金额', dataIndex: 'amount', width: 110, align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v, row) => (
        <div style={{ fontVariantNumeric: 'tabular-nums' }}>
          ¥ {fmtMoney(v)}
          {row.discount > 0 && <div style={{ color: '#fa8c16', fontSize: 12 }}>-¥ {fmtMoney(row.discount)}</div>}
        </div>
      )
    },
    { title: 'SKU', dataIndex: 'skuCount', width: 56, align: 'right' },
    {
      title: '状态', dataIndex: 'status', width: 86,
      render: (v) => <Tag color={STATUS_COLOR[v]} style={{ marginInlineEnd: 0 }}>{STATUS_TEXT[v]}</Tag>
    },
    {
      title: '风险', dataIndex: 'riskLevel', width: 78,
      render: (v) => (v === 'LOW' ? <span style={{ color: '#999' }}>低</span> : <Tag color={RISK_COLOR[v]} style={{ marginInlineEnd: 0 }}>{RISK_TEXT[v]}</Tag>)
    },
    {
      title: '渠道 / 支付', width: 110,
      render: (_, row) => <span style={{ color: '#666' }}>{CHANNEL_TEXT[row.channel]} · {PAY_TEXT[row.payType]}</span>
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 110, defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <Tooltip title={fmtDateTime(v)}><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDate(v)}</span></Tooltip>
    },
    {
      title: '', key: 'remark', width: 36,
      render: (_, row) => row.remark
        ? <Tooltip title={row.remark}><MessageOutlined style={{ color: '#faad14' }} /></Tooltip>
        : null
    },
    {
      title: '操作', key: 'action', fixed: 'right', width: 150,
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" type="link" style={{ padding: '0 4px' }} onClick={() => setDetail(row)}>详情</Button>
          <Button size="small" type="link" style={{ padding: '0 4px' }} disabled={row.status !== 'PAID'}
            onClick={() => actions.remindShip(row)}>催发货</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '拉黑客户', danger: true },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') actions.copyOrderNo(row)
                if (key === 'blacklist') actions.blacklist(row)
                if (key === 'delete') actions.deleteOrder(row)
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
    <div style={{ padding: '12px 16px', background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`.ed-row-alt td { background: #fafafa; }`}</style>
      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>订单管理</span>
        <Space size={8}>
          <Button onClick={() => actions.exportAll(filtered.length)}>导出全部</Button>
          <Button icon={<ReloadOutlined />} onClick={actions.syncErp}>同步 ERP</Button>
        </Space>
      </div>

      {/* 筛选条：高频常驻 + 低频折叠 */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', padding: '10px 12px', marginBottom: 8 }}>
        <Space size={8} wrap>
          <Input.Search allowClear placeholder="订单号 / 外部交易号 / 客户姓名 / 手机号" style={{ width: 300 }}
            value={filters.keyword} onChange={(e) => setF({ keyword: e.target.value })} />
          <Select allowClear placeholder="状态" style={{ width: 110 }} value={filters.status}
            onChange={(v) => setF({ status: v })} options={STATUS_OPTIONS} />
          <RangePicker value={filters.dateRange} onChange={(v) => setF({ dateRange: v })} />
          <Popover content={moreFilterContent} title="更多筛选" trigger="click" placement="bottomLeft">
            <Button icon={<FilterOutlined />}>
              更多筛选{[filters.channel, filters.payType, filters.riskLevel].filter(Boolean).length > 0 &&
                ` (${[filters.channel, filters.payType, filters.riskLevel].filter(Boolean).length})`}
            </Button>
          </Popover>
          {tags.length > 0 && <Button type="link" onClick={clearAll}>清空筛选</Button>}
        </Space>
        {tags.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {tags.map((t) => (
              <Tag key={t.key} closable onClose={() => setF({ [t.key]: t.key === 'keyword' ? '' : t.key === 'dateRange' ? null : undefined })}>
                {t.label}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 工具栏：批量操作 + 计数 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Space size={8}>
          <Button danger disabled={selectedKeys.length === 0} onClick={() => actions.batchClose(selectedKeys, rows)}>
            批量关闭{selectedKeys.length > 0 && `（${selectedKeys.length}）`}
          </Button>
          {selectedKeys.length > 0 && (
            <>
              <span style={{ color: '#666' }}>已选 {selectedKeys.length} 条</span>
              <Button type="link" onClick={() => setSelectedKeys([])}>取消选择</Button>
            </>
          )}
        </Space>
        <span style={{ color: '#999' }}>共 {filtered.length} 条</span>
      </div>

      {/* 错误横幅 */}
      {error && (
        <Alert type="error" showIcon style={{ marginBottom: 8 }} message="订单列表加载失败" description={error}
          action={<Button size="small" danger onClick={reload}>重试</Button>} />
      )}

      {/* 数据主体 */}
      {loading ? (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', padding: 16 }}>
          <Skeleton active title={false} paragraph={{ rows: 10, width: '100%' }} />
        </div>
      ) : (
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1080 }}
          rowClassName={(_, i) => (i % 2 === 1 ? 'ed-row-alt' : '')}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          pagination={{ pageSize: 20, size: 'small', showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={tags.length > 0 ? '当前筛选条件下没有订单' : error ? '加载失败，请重试' : '暂无订单'}>
                {tags.length > 0 && <Button type="primary" size="small" onClick={clearAll}>清空筛选</Button>}
              </Empty>
            )
          }}
        />
      )}

      {/* 详情抽屉 */}
      <Drawer title={detail ? `订单详情 · ${detail.orderNo}` : '订单详情'} width={560}
        open={!!detail} onClose={() => setDetail(null)}
        extra={detail && (
          <Button type="primary" size="small" disabled={detail.status !== 'PAID'} onClick={() => actions.remindShip(detail)}>
            催发货
          </Button>
        )}>
        <OrderDescriptions order={detail} column={2} />
      </Drawer>
    </div>
  )
}

export default function EnterpriseDense() {
  const [scenario, setScenario] = useState('normal')
  return (
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{ token: { borderRadius: 4, fontSize: 13, colorPrimary: '#1677ff' } }}
    >
      <App>
        <ScenarioBar value={scenario} onChange={setScenario} />
        <DensePage scenario={scenario} />
      </App>
    </ConfigProvider>
  )
}
