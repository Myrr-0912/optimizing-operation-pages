import React, { useMemo, useState } from 'react'
import {
  Alert, App, Avatar, Button, Card, Col, ConfigProvider, DatePicker, Dropdown, Empty,
  Input, Modal, Result, Row, Select, Skeleton, Space, Statistic, Table, Tabs, Tag, Typography
} from 'antd'
import { DownOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import {
  STATUS_TEXT, STATUS_COLOR, RISK_TEXT, RISK_COLOR, PAY_TEXT, CHANNEL_TEXT,
  CHANNEL_OPTIONS, PAY_OPTIONS, RISK_OPTIONS
} from '../../shared/constants.js'
import { fmtMoney, fmtDateTime } from '../../shared/format.js'
import { useOrders, filterOrders, activeFilterTags, EMPTY_FILTERS } from '../../shared/useOrders.js'
import { useOrderActions } from '../../shared/useOrderActions.js'
import { OrderDescriptions } from '../../shared/OrderDescriptions.jsx'
import { ScenarioBar } from '../../shared/ScenarioBar.jsx'

const { RangePicker } = DatePicker
const DICTS = { STATUS_TEXT, CHANNEL_TEXT, PAY_TEXT, RISK_TEXT }
const AVATAR_COLORS = ['#f56a00', '#7265e6', '#00a2ae', '#ffbf00', '#87d068']

function CleanPage({ scenario }) {
  const { rows, setRows, loading, error, reload } = useOrders(scenario)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)
  const [showMore, setShowMore] = useState(false)
  const actions = useOrderActions({ setRows, setSelectedKeys, reload })

  const filtered = useMemo(() => filterOrders(rows, filters), [rows, filters])
  const setF = (patch) => setFilters((prev) => ({ ...prev, ...patch }))
  const clearAll = () => setFilters(EMPTY_FILTERS)
  const tags = activeFilterTags(filters, DICTS)

  const statusCount = useMemo(() => {
    const m = { ALL: rows.length }
    for (const s of Object.keys(STATUS_TEXT)) m[s] = 0
    for (const r of rows) m[r.status] = (m[r.status] || 0) + 1
    return m
  }, [rows])

  const stats = useMemo(() => ({
    total: rows.length,
    waitPay: rows.filter((r) => r.status === 'WAIT_PAY').length,
    refunding: rows.filter((r) => r.status === 'REFUNDING').length,
    gmv: rows.reduce((s, r) => s + r.amount, 0)
  }), [rows])

  const columns = [
    {
      title: '订单', dataIndex: 'orderNo', width: 210,
      render: (v, row) => (
        <div>
          <Typography.Link strong onClick={() => setDetail(row)}>{v}</Typography.Link>
          <div style={{ color: '#999', fontSize: 13 }}>{row.outTradeNo ? `交易号 ${row.outTradeNo}` : '未支付渠道单'}</div>
        </div>
      )
    },
    {
      title: '客户', dataIndex: 'customerName', width: 180,
      render: (v, row) => (
        <Space>
          <Avatar size={36} style={{ background: AVATAR_COLORS[v.charCodeAt(0) % AVATAR_COLORS.length] }}>{v[0]}</Avatar>
          <div>
            {v}
            <div style={{ color: '#999', fontSize: 13 }}>{row.customerPhone}</div>
          </div>
        </Space>
      )
    },
    {
      title: '金额', dataIndex: 'amount', width: 130, align: 'right',
      render: (v, row) => (
        <div style={{ fontVariantNumeric: 'tabular-nums' }}>
          <Typography.Text strong>¥ {fmtMoney(v)}</Typography.Text>
          <div style={{ color: '#999', fontSize: 13 }}>{row.skuCount} 件商品{row.discount > 0 ? ` · 省 ¥${fmtMoney(row.discount)}` : ''}</div>
        </div>
      )
    },
    {
      title: '状态', dataIndex: 'status', width: 110,
      render: (v, row) => (
        <Space direction="vertical" size={2}>
          <Tag bordered={false} color={STATUS_COLOR[v]} style={{ borderRadius: 999, paddingInline: 10 }}>{STATUS_TEXT[v]}</Tag>
          {row.riskLevel !== 'LOW' && (
            <Tag bordered={false} color={RISK_COLOR[row.riskLevel]} style={{ borderRadius: 999, paddingInline: 10 }}>{RISK_TEXT[row.riskLevel]}</Tag>
          )}
        </Space>
      )
    },
    {
      title: '来源', width: 130,
      render: (_, row) => <span style={{ color: '#666' }}>{CHANNEL_TEXT[row.channel]} · {PAY_TEXT[row.payType]}</span>
    },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 170, defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <span style={{ color: '#666', fontVariantNumeric: 'tabular-nums' }}>{fmtDateTime(v)}</span>
    },
    {
      title: '', key: 'action', width: 150, align: 'right',
      render: (_, row) => (
        <Space>
          <Button onClick={() => setDetail(row)}>详情</Button>
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
                if (key === 'delete') actions.deleteOrder(row)
              }
            }}
          >
            <Button icon={<DownOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px 24px 48px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* 页头 + 摘要统计 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>订单管理</Typography.Title>
            <Typography.Text type="secondary">查询、跟进并处理商城全部订单</Typography.Text>
          </div>
          <Space>
            <Button icon={<UploadOutlined />} onClick={() => actions.exportAll(filtered.length)}>导出全部</Button>
            <Button icon={<ReloadOutlined />} onClick={actions.syncErp}>同步 ERP</Button>
          </Space>
        </div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Card><Statistic title="订单总数" value={stats.total} loading={loading} /></Card></Col>
          <Col span={6}><Card><Statistic title="待支付" value={stats.waitPay} loading={loading} valueStyle={{ color: '#faad14' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="退款中" value={stats.refunding} loading={loading} valueStyle={{ color: '#fa541c' }} /></Card></Col>
          <Col span={6}><Card><Statistic title="销售总额（元）" value={stats.gmv} precision={2} loading={loading} /></Card></Col>
        </Row>

        {/* 搜索卡 */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: showMore || tags.length ? 16 : 8 } }}>
          <Tabs
            activeKey={filters.status || 'ALL'}
            onChange={(k) => setF({ status: k === 'ALL' ? undefined : k })}
            items={[
              { key: 'ALL', label: `全部 ${statusCount.ALL ?? 0}` },
              ...Object.entries(STATUS_TEXT).map(([k, label]) => ({ key: k, label: `${label} ${statusCount[k] ?? 0}` }))
            ]}
          />
          <Space wrap size={12}>
            <Input.Search allowClear size="large" placeholder="搜索订单号 / 交易号 / 客户姓名 / 手机号" style={{ width: 380 }}
              value={filters.keyword} onChange={(e) => setF({ keyword: e.target.value })} />
            <RangePicker size="large" value={filters.dateRange} onChange={(v) => setF({ dateRange: v })}
              presets={[
                { label: '最近 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
                { label: '最近 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
                { label: '2026 年 6 月', value: [dayjs('2026-06-01'), dayjs('2026-06-30')] }
              ]} />
            <Button size="large" type="text" onClick={() => setShowMore(!showMore)}>
              更多筛选 <DownOutlined rotate={showMore ? 180 : 0} style={{ fontSize: 11 }} />
            </Button>
            {tags.length > 0 && <Button size="large" type="link" onClick={clearAll}>清空筛选</Button>}
          </Space>
          {showMore && (
            <Space wrap size={12} style={{ marginTop: 12 }}>
              <Select allowClear placeholder="渠道" style={{ width: 140 }} value={filters.channel}
                onChange={(v) => setF({ channel: v })} options={CHANNEL_OPTIONS} />
              <Select allowClear placeholder="支付方式" style={{ width: 140 }} value={filters.payType}
                onChange={(v) => setF({ payType: v })} options={PAY_OPTIONS} />
              <Select allowClear placeholder="风险等级" style={{ width: 140 }} value={filters.riskLevel}
                onChange={(v) => setF({ riskLevel: v })} options={RISK_OPTIONS} />
            </Space>
          )}
          {tags.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {tags.map((t) => (
                <Tag key={t.key} closable bordered={false} style={{ borderRadius: 999, background: '#f0f5ff', paddingInline: 10 }}
                  onClose={() => setF({ [t.key]: t.key === 'keyword' ? '' : t.key === 'dateRange' ? null : undefined })}>
                  {t.label}
                </Tag>
              ))}
            </div>
          )}
        </Card>

        {/* 数据卡 */}
        <Card>
          {selectedKeys.length > 0 && (
            <Alert type="info" showIcon={false} style={{ marginBottom: 16, borderRadius: 8 }}
              message={
                <Space size={16}>
                  <span>已选 {selectedKeys.length} 笔订单</span>
                  <Button size="small" danger onClick={() => actions.batchClose(selectedKeys, rows)}>批量关闭</Button>
                  <Button size="small" type="link" onClick={() => setSelectedKeys([])}>取消选择</Button>
                </Space>
              } />
          )}
          {error ? (
            <Result status="error" title="订单列表加载失败" subTitle={error}
              extra={<Button type="primary" onClick={reload}>重新加载</Button>} />
          ) : loading ? (
            <Skeleton active avatar paragraph={{ rows: 8 }} />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
              locale={{
                emptyText: (
                  <Empty style={{ padding: '32px 0' }}
                    description={tags.length > 0 ? '没有符合条件的订单，试试放宽筛选条件' : '还没有订单'}>
                    {tags.length > 0 && <Button type="primary" onClick={clearAll}>清空筛选</Button>}
                  </Empty>
                )
              }}
            />
          )}
        </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal title={detail ? `订单详情 · ${detail.orderNo}` : '订单详情'} width={680}
        open={!!detail} onCancel={() => setDetail(null)}
        footer={detail && (
          <Space>
            <Button onClick={() => setDetail(null)}>关闭</Button>
            <Button type="primary" disabled={detail.status !== 'PAID'} onClick={() => actions.remindShip(detail)}>催发货</Button>
          </Space>
        )}>
        <OrderDescriptions order={detail} column={2} size="middle" />
      </Modal>
    </div>
  )
}

export default function ModernClean({ }) {
  const [scenario, setScenario] = useState('normal')
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ token: { borderRadius: 10, colorPrimary: '#4f6ef7', colorBgLayout: '#f0f2f5' } }}
    >
      <App>
        <ScenarioBar value={scenario} onChange={setScenario} />
        <CleanPage scenario={scenario} />
      </App>
    </ConfigProvider>
  )
}
