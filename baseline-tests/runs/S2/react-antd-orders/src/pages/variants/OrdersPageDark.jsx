import { useMemo, useState } from 'react'
import {
  App as AntApp,
  Badge,
  Button,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Input,
  Select,
  Space,
  Table,
  Tag,
  theme
} from 'antd'
import {
  DownloadOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  ThunderboltFilled
} from '@ant-design/icons'
import {
  CHANNEL_TEXT,
  OrderDetailDrawer,
  PAY_TEXT,
  RISK_META,
  STATUS_META,
  applyFilters,
  channelOptions,
  copyText,
  fmtMoney,
  fmtTime,
  payOptions,
  riskOptions,
  statusOptions,
  useOrders
} from './shared'

const { RangePicker } = DatePicker
const MONO = { fontFamily: "Consolas, 'JetBrains Mono', Menlo, monospace" }

const NEON = {
  WAIT_PAY: '#faad14',
  PAID: '#36cfc9',
  SHIPPED: '#597ef7',
  FINISHED: '#52c41a',
  CLOSED: '#5c6b8a',
  REFUNDING: '#ff4d4f'
}

function Kpi({ label, value, accent, mono }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(180deg, #17203a 0%, #131a2e 100%)',
        border: '1px solid #232e4d',
        borderTop: `2px solid ${accent}`,
        borderRadius: 10,
        padding: '14px 18px'
      }}
    >
      <div style={{ color: '#7d8ab0', fontSize: 12, letterSpacing: 1 }}>{label}</div>
      <div style={{ color: accent, fontSize: 26, fontWeight: 700, marginTop: 4, ...(mono ? MONO : {}) }}>{value}</div>
    </div>
  )
}

function DarkInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, reload } = useOrders()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState()
  const [channel, setChannel] = useState()
  const [payType, setPayType] = useState()
  const [riskLevel, setRiskLevel] = useState()
  const [dateRange, setDateRange] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(
    () => applyFilters(data, { keyword, status, channel, payType, riskLevel, dateRange }),
    [data, keyword, status, channel, payType, riskLevel, dateRange]
  )

  const stats = useMemo(
    () => ({
      total: data.length,
      amount: data.reduce((s, d) => s + d.amount, 0),
      waitPay: data.filter((d) => d.status === 'WAIT_PAY').length,
      toShip: data.filter((d) => d.status === 'PAID').length,
      refunding: data.filter((d) => d.status === 'REFUNDING').length,
      highRisk: data.filter((d) => d.riskLevel === 'HIGH').length
    }),
    [data]
  )

  function resetFilters() {
    setKeyword('')
    setStatus(undefined)
    setChannel(undefined)
    setPayType(undefined)
    setRiskLevel(undefined)
    setDateRange(null)
  }

  function handleDelete(row) {
    modal.confirm({
      title: '删除订单',
      content: `确定删除订单 ${row.orderNo} 吗？删除后不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        setData((prev) => prev.filter((d) => d.id !== row.id))
        message.success('订单已删除')
      }
    })
  }

  function handleBatchClose() {
    modal.confirm({
      title: '批量关闭订单',
      content: `确认关闭选中的 ${selectedKeys.length} 个订单？`,
      okText: '确认关闭',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        setData((prev) => prev.map((d) => (selectedKeys.includes(d.id) ? { ...d, status: 'CLOSED' } : d)))
        setSelectedKeys([])
        message.success('批量关闭完成')
      }
    })
  }

  function handleMenu(key, row) {
    if (key === 'copy') copyText(row.orderNo, message)
    else if (key === 'blacklist')
      modal.confirm({
        title: '拉黑客户',
        content: `确认将客户「${row.customerName}」加入黑名单？`,
        okText: '确认拉黑',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: () => message.success(`已将 ${row.customerName} 加入黑名单`)
      })
    else if (key === 'delete') handleDelete(row)
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 160,
      render: (v, row) => (
        <a onClick={() => setDetail(row)} style={{ ...MONO, color: '#36cfc9' }}>
          {v}
        </a>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 150,
      render: (v, row) => (
        <>
          <div style={{ color: '#dce3f5' }}>{v}</div>
          <div style={{ color: '#5c6b8a', fontSize: 12, ...MONO }}>{row.customerPhone}</div>
        </>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v, row) => (
        <>
          <div style={{ ...MONO, color: '#e8ecf8', fontWeight: 600 }}>{fmtMoney(v)}</div>
          {row.discount > 0 && <div style={{ color: '#5c6b8a', fontSize: 12 }}>惠 -{row.discount}</div>}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v) => <Badge color={NEON[v]} text={<span style={{ color: NEON[v] }}>{STATUS_META[v]?.text || v}</span>} />
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 130,
      render: (v, row) => (
        <>
          <div style={{ color: '#aeb9d6' }}>{CHANNEL_TEXT[v] || v}</div>
          <div style={{ color: '#5c6b8a', fontSize: 12 }}>{PAY_TEXT[row.payType] || row.payType}</div>
        </>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (v) =>
        v === 'HIGH' ? (
          <Tag color="error" style={{ background: 'rgba(255,77,79,0.12)' }}>
            <ThunderboltFilled /> 高危
          </Tag>
        ) : (
          <span style={{ color: v === 'MID' ? '#faad14' : '#5c6b8a' }}>{RISK_META[v].short}</span>
        )
    },
    {
      title: '同步',
      dataIndex: 'syncFlag',
      width: 70,
      render: (v) =>
        v ? <span style={{ color: '#52c41a', fontSize: 12 }}>● 已同步</span> : <span style={{ color: '#faad14', fontSize: 12 }}>○ 未同步</span>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 140,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v) => <span style={{ ...MONO, color: '#7d8ab0', fontSize: 12 }}>{fmtTime(v)}</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 170,
      render: (_, row) => (
        <Space size={8}>
          <a onClick={() => setDetail(row)}>详情</a>
          <a onClick={() => message.success(`已向仓库催促订单 ${row.orderNo} 发货`)}>催发货</a>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { key: 'blacklist', label: '拉黑客户' },
                { type: 'divider' },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => handleMenu(key, row)
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f1c', colorScheme: 'dark' }}>
      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '22px 26px' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ width: 4, height: 26, background: '#36cfc9', borderRadius: 2, marginRight: 12 }} />
          <div>
            <div style={{ color: '#e8ecf8', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>订单指挥台</div>
            <div style={{ color: '#5c6b8a', fontSize: 12, letterSpacing: 1 }}>ORDER OPERATIONS CONSOLE</div>
          </div>
          <Space style={{ marginLeft: 'auto' }}>
            <Button ghost icon={<SyncOutlined />} onClick={() => message.success('已发起 ERP 同步')}>
              同步 ERP
            </Button>
            <Button ghost icon={<DownloadOutlined />} onClick={() => message.success('导出任务已提交，请稍后到下载中心查看')}>
              导出全部
            </Button>
            <Button type="primary" icon={<ReloadOutlined />} onClick={reload}>
              刷新
            </Button>
          </Space>
        </div>

        {/* KPI 条 */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          <Kpi label="订单总数" value={stats.total} accent="#36cfc9" mono />
          <Kpi label="交易总额" value={fmtMoney(stats.amount)} accent="#597ef7" mono />
          <Kpi label="待支付" value={stats.waitPay} accent="#faad14" mono />
          <Kpi label="待发货" value={stats.toShip} accent="#9254de" mono />
          <Kpi label="退款中" value={stats.refunding} accent="#ff7a45" mono />
          <Kpi label="高风险" value={stats.highRisk} accent="#ff4d4f" mono />
        </div>

        {/* 筛选条 */}
        <div
          style={{
            background: '#131a2e',
            border: '1px solid #232e4d',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 14,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center'
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#5c6b8a' }} />}
            placeholder="订单号 / 外部单号 / 客户 / 手机"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 280 }}
          />
          <Select placeholder="状态" allowClear value={status} onChange={setStatus} options={statusOptions} style={{ width: 110 }} />
          <Select placeholder="渠道" allowClear value={channel} onChange={setChannel} options={channelOptions} style={{ width: 110 }} />
          <Select placeholder="支付方式" allowClear value={payType} onChange={setPayType} options={payOptions} style={{ width: 120 }} />
          <Select placeholder="风险" allowClear value={riskLevel} onChange={setRiskLevel} options={riskOptions} style={{ width: 110 }} />
          <RangePicker value={dateRange} onChange={setDateRange} />
          <a onClick={resetFilters}>重置</a>
          <span style={{ marginLeft: 'auto', color: '#5c6b8a', fontSize: 12 }}>
            命中 {filtered.length} 条
            {selectedKeys.length > 0 && (
              <>
                {' '}
                · 已选 {selectedKeys.length} 项{' '}
                <Button size="small" danger onClick={handleBatchClose} style={{ marginLeft: 8 }}>
                  批量关闭
                </Button>
              </>
            )}
          </span>
        </div>

        {/* 表格 */}
        <div style={{ background: '#131a2e', border: '1px solid #232e4d', borderRadius: 10, padding: 12 }}>
          <Table
            rowKey="id"
            size="middle"
            loading={loading}
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1180 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          />
        </div>
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  )
}

/** 方案 D · 暗色驾驶舱：深色监控台风格，KPI 总览 + 霓虹状态标识 */
export default function OrdersPageDark() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#36cfc9',
          borderRadius: 8,
          colorBgContainer: '#131a2e',
          colorBgElevated: '#1a2340',
          colorBgLayout: '#0b0f1c',
          colorBorder: '#2a365a',
          colorBorderSecondary: '#232e4d',
          colorText: '#c9d3ec',
          colorTextSecondary: '#7d8ab0'
        },
        components: {
          Table: { headerBg: '#17203a', rowHoverBg: '#1a2340', borderColor: '#232e4d' }
        }
      }}
    >
      <AntApp>
        <DarkInner />
      </AntApp>
    </ConfigProvider>
  )
}
