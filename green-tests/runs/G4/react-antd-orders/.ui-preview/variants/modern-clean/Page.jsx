import React, { useMemo, useState } from 'react'
import {
  App as AntApp,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import { useOrders } from '../../shared/useOrders.js'
import { filterOrders, hasActiveFilters } from '../../shared/filters.js'
import ScenarioBar from '../../shared/ScenarioBar.jsx'
import OrderDetailDrawer from '../../shared/OrderDetailDrawer.jsx'
import {
  STATUS_TEXT,
  STATUS_COLOR,
  PAY_TEXT,
  CHANNEL_TEXT,
  RISK_TEXT,
  RISK_COLOR,
  CHANNEL_OPTIONS,
  PAY_OPTIONS,
  RISK_OPTIONS,
  fmtAmount,
  fmtDateTime,
  maskPhone
} from '../../shared/dict.js'
import { urgeShip, copyOrderNo, confirmDelete, confirmBlacklist, confirmBatchClose, exportAll, syncErp } from '../../shared/actions.js'

const { RangePicker } = DatePicker

const EMPTY_FILTERS = {
  keyword: '',
  status: undefined,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined,
  dateRange: null
}

function CleanPageInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, error, scenario, setScenario, reload } = useOrders()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [moreOpen, setMoreOpen] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => filterOrders(data, filters), [data, filters])
  const patch = (p) => setFilters((f) => ({ ...f, ...p }))
  const clearFilters = () => setFilters(EMPTY_FILTERS)
  const filtering = hasActiveFilters(filters)

  const stats = useMemo(
    () => ({
      total: data.length,
      waitPay: data.filter((r) => r.status === 'WAIT_PAY').length,
      refunding: data.filter((r) => r.status === 'REFUNDING').length,
      highRisk: data.filter((r) => r.riskLevel === 'HIGH').length
    }),
    [data]
  )

  const tabItems = useMemo(() => {
    const countOf = (s) => data.filter((r) => r.status === s).length
    return [
      { key: 'ALL', label: `全部 ${data.length}` },
      ...Object.keys(STATUS_TEXT).map((s) => ({ key: s, label: `${STATUS_TEXT[s]} ${countOf(s)}` }))
    ]
  }, [data])

  const columns = [
    {
      title: '订单',
      dataIndex: 'orderNo',
      width: 210,
      render: (v, row) => (
        <div style={{ lineHeight: 1.5 }}>
          <Typography.Link strong onClick={() => setDetail(row)}>
            {v}
          </Typography.Link>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>
            {row.outTradeNo ? `交易号 ${row.outTradeNo}` : '无外部交易号'}
          </div>
        </div>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 140,
      render: (v, row) => (
        <div style={{ lineHeight: 1.5 }}>
          <div>{v}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{maskPhone(row.customerPhone)}</div>
        </div>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      render: (v, row) => (
        <div style={{ lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtAmount(v)}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>
            {row.discount ? `优惠 -${row.discount} · ` : ''}
            {row.freight ? `运费 ${row.freight}` : '包邮'} · {row.skuCount} 件
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => (
        <Tag color={STATUS_COLOR[v]} style={{ borderRadius: 999, paddingInline: 10 }}>
          {STATUS_TEXT[v]}
        </Tag>
      )
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 130,
      render: (v, row) => (
        <div style={{ lineHeight: 1.5 }}>
          <div>{CHANNEL_TEXT[v] || v}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{PAY_TEXT[row.payType] || row.payType}</div>
        </div>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (v) =>
        v === 'LOW' ? (
          <span style={{ color: '#bfbfbf' }}>低</span>
        ) : (
          <Tag color={RISK_COLOR[v]} style={{ borderRadius: 999, paddingInline: 10 }}>
            {RISK_TEXT[v]}
          </Tag>
        )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDateTime(v)}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_, row) => (
        <Space size={0}>
          <Button type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          <Button type="link" onClick={() => urgeShip(message, row)}>
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
            <Button type="link">更多</Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '24px 24px 64px 24px' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        {/* 页头：标题 + 全局操作 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>
              订单管理
            </Typography.Title>
            <Typography.Text type="secondary">查询、跟进并处理商城全渠道订单</Typography.Text>
          </div>
          <Space>
            <Button onClick={() => syncErp(message)}>同步 ERP</Button>
            <Button type="primary" onClick={() => exportAll(message, filtered.length)}>
              导出全部
            </Button>
          </Space>
        </div>

        {/* 摘要统计卡 */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card variant="borderless">
              <Statistic title="全部订单" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="borderless">
              <Statistic title="待支付" value={stats.waitPay} valueStyle={{ color: '#d4a017' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="borderless">
              <Statistic title="退款中" value={stats.refunding} valueStyle={{ color: '#d4380d' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card variant="borderless">
              <Statistic title="高风险订单" value={stats.highRisk} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
        </Row>

        {/* 搜索卡：聚合搜索 + 常用筛选 + 折叠更多 */}
        <Card variant="borderless" style={{ marginBottom: 20 }}>
          <Space wrap size={12}>
            <Input.Search
              allowClear
              placeholder="搜索订单号 / 外部交易号 / 客户姓名 / 手机号"
              style={{ width: 360 }}
              value={filters.keyword}
              onChange={(e) => patch({ keyword: e.target.value })}
            />
            <RangePicker
              value={filters.dateRange}
              onChange={(v) => patch({ dateRange: v })}
              presets={[
                { label: '近 7 天', value: [dayjs().add(-7, 'd'), dayjs()] },
                { label: '近 30 天', value: [dayjs().add(-30, 'd'), dayjs()] },
                { label: '上月', value: [dayjs().add(-1, 'month').startOf('month'), dayjs().add(-1, 'month').endOf('month')] }
              ]}
            />
            <Button type="link" onClick={() => setMoreOpen((o) => !o)}>
              {moreOpen ? '收起筛选' : '更多筛选'}
            </Button>
            {filtering && (
              <Button type="link" onClick={clearFilters}>
                清空条件
              </Button>
            )}
            <Button onClick={reload}>刷新</Button>
          </Space>
          {moreOpen && (
            <Space wrap size={12} style={{ marginTop: 16 }}>
              <Select
                allowClear
                placeholder="渠道"
                style={{ width: 140 }}
                value={filters.channel}
                onChange={(v) => patch({ channel: v })}
                options={CHANNEL_OPTIONS}
              />
              <Select
                allowClear
                placeholder="支付方式"
                style={{ width: 140 }}
                value={filters.payType}
                onChange={(v) => patch({ payType: v })}
                options={PAY_OPTIONS}
              />
              <Select
                allowClear
                placeholder="风险等级"
                style={{ width: 140 }}
                value={filters.riskLevel}
                onChange={(v) => patch({ riskLevel: v })}
                options={RISK_OPTIONS}
              />
            </Space>
          )}
        </Card>

        {/* 数据卡：状态页签 + 表格 */}
        <Card variant="borderless">
          <Tabs
            activeKey={filters.status || 'ALL'}
            onChange={(k) => patch({ status: k === 'ALL' ? undefined : k })}
            items={tabItems}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 16px 0' }}>
            <Space>
              <Button
                danger
                disabled={!selectedKeys.length}
                onClick={() =>
                  confirmBatchClose(modal, message, selectedKeys.length, () => {
                    setData((d) => d.map((x) => (selectedKeys.includes(x.id) ? { ...x, status: 'CLOSED' } : x)))
                    setSelectedKeys([])
                  })
                }
              >
                批量关闭{selectedKeys.length ? `（已选 ${selectedKeys.length}）` : ''}
              </Button>
              {selectedKeys.length > 0 && (
                <Button type="link" onClick={() => setSelectedKeys([])}>
                  取消选择
                </Button>
              )}
            </Space>
            <Typography.Text type="secondary">
              {filtering ? `筛选出 ${filtered.length} / ${data.length} 条` : `共 ${data.length} 条`}
            </Typography.Text>
          </div>

          {error ? (
            <Result
              status="error"
              title="订单列表加载失败"
              subTitle={error}
              extra={
                <Button type="primary" onClick={reload}>
                  重试
                </Button>
              }
            />
          ) : loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : filtered.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '48px 0' }}
              description={filtering ? '没有匹配当前条件的订单，试试放宽筛选' : '暂无订单数据'}
            >
              {filtering && (
                <Button type="primary" onClick={clearFilters}>
                  清空筛选
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
              scroll={{ x: 1150 }}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
            />
          )}
        </Card>
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} width={520} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

// 风格包 modern-clean：卡片分区、默认密度、大圆角、留白与轻阴影
export default function ModernCleanPage() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          borderRadius: 10,
          colorBgLayout: '#f5f7fa',
          boxShadowTertiary: '0 1px 4px rgba(15, 23, 42, 0.06)'
        }
      }}
    >
      <AntApp>
        <CleanPageInner />
      </AntApp>
    </ConfigProvider>
  )
}
