import { useMemo, useState } from 'react'
import {
  App as AntApp,
  Avatar,
  Button,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Input,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip
} from 'antd'
import {
  CloudSyncOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons'
import {
  CHANNEL_TEXT,
  OrderDetailDrawer,
  PAY_TEXT,
  RISK_META,
  STATUS_KEYS,
  STATUS_META,
  applyFilters,
  channelOptions,
  copyText,
  fmtMoney,
  fmtTime,
  payOptions,
  riskOptions,
  useOrders
} from './shared'

const { RangePicker } = DatePicker

const AVATAR_COLORS = ['#7c5cfc', '#2aa7ff', '#00b578', '#ff7d00', '#f5426f']
const PILL_COLORS = {
  WAIT_PAY: { bg: '#fff4e6', fg: '#d46b08' },
  PAID: { bg: '#e6f0ff', fg: '#2b5fd9' },
  SHIPPED: { bg: '#ede9fe', fg: '#6d4de0' },
  FINISHED: { bg: '#e4f8ee', fg: '#0f9d63' },
  CLOSED: { bg: '#f2f3f5', fg: '#7a8190' },
  REFUNDING: { bg: '#ffe9e6', fg: '#d4380d' }
}

function StatCard({ label, value, sub, color, bg }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#fff',
        borderRadius: 16,
        padding: '18px 22px',
        boxShadow: '0 1px 4px rgba(24, 31, 67, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700
        }}
      >
        {String(label)[0]}
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#8a91a3' }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1c2333', lineHeight: 1.3 }}>
          {value}
          {sub && <span style={{ fontSize: 12, fontWeight: 400, color: '#8a91a3', marginLeft: 6 }}>{sub}</span>}
        </div>
      </div>
    </div>
  )
}

function AiryInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, reload } = useOrders()
  const [statusTab, setStatusTab] = useState('ALL')
  const [keyword, setKeyword] = useState('')
  const [channel, setChannel] = useState()
  const [payType, setPayType] = useState()
  const [riskLevel, setRiskLevel] = useState()
  const [dateRange, setDateRange] = useState(null)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(
    () =>
      applyFilters(data, {
        keyword,
        status: statusTab === 'ALL' ? undefined : statusTab,
        channel,
        payType,
        riskLevel,
        dateRange
      }),
    [data, keyword, statusTab, channel, payType, riskLevel, dateRange]
  )

  const counts = useMemo(() => {
    const c = { ALL: data.length }
    STATUS_KEYS.forEach((k) => {
      c[k] = data.filter((d) => d.status === k).length
    })
    return c
  }, [data])

  const stats = useMemo(
    () => ({
      total: data.length,
      amount: data.reduce((s, d) => s + d.amount, 0),
      waitPay: data.filter((d) => d.status === 'WAIT_PAY').length,
      refunding: data.filter((d) => d.status === 'REFUNDING').length,
      highRisk: data.filter((d) => d.riskLevel === 'HIGH').length
    }),
    [data]
  )

  function resetFilters() {
    setKeyword('')
    setStatusTab('ALL')
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
    if (key === 'urge') message.success(`已向仓库催促订单 ${row.orderNo} 发货`)
    else if (key === 'copy') copyText(row.orderNo, message)
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
      title: '订单',
      dataIndex: 'orderNo',
      width: 220,
      render: (v, row) => (
        <>
          <a onClick={() => setDetail(row)} style={{ fontWeight: 600, color: '#4a3fd6' }}>
            {v}
          </a>
          <div style={{ color: '#9aa1b3', fontSize: 12, marginTop: 2 }}>{fmtTime(row.createdAt)}</div>
        </>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 190,
      render: (v, row) => (
        <Space size={10}>
          <Avatar
            size={34}
            style={{
              background: AVATAR_COLORS[v.charCodeAt(0) % AVATAR_COLORS.length] + '22',
              color: AVATAR_COLORS[v.charCodeAt(0) % AVATAR_COLORS.length],
              fontWeight: 600
            }}
          >
            {v[0]}
          </Avatar>
          <span>
            <div style={{ fontWeight: 500 }}>{v}</div>
            <div style={{ color: '#9aa1b3', fontSize: 12 }}>{row.customerPhone}</div>
          </span>
        </Space>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v, row) => (
        <>
          <div style={{ fontWeight: 700, color: '#1c2333' }}>{fmtMoney(v)}</div>
          <div style={{ color: '#9aa1b3', fontSize: 12 }}>
            {row.skuCount} 件{row.discount > 0 ? ` · 惠${fmtMoney(row.discount)}` : ''}
          </div>
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v) => {
        const p = PILL_COLORS[v] || PILL_COLORS.CLOSED
        return (
          <span
            style={{
              background: p.bg,
              color: p.fg,
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            {STATUS_META[v]?.text || v}
          </span>
        )
      }
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 130,
      render: (v, row) => (
        <>
          <div>{CHANNEL_TEXT[v] || v}</div>
          <div style={{ color: '#9aa1b3', fontSize: 12 }}>{PAY_TEXT[row.payType] || row.payType}</div>
        </>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (v) => (
        <span style={{ color: v === 'LOW' ? '#9aa1b3' : RISK_META[v].dot, fontWeight: v === 'HIGH' ? 600 : 400 }}>
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: 4,
              background: RISK_META[v].dot,
              marginRight: 6,
              verticalAlign: 'middle'
            }}
          />
          {RISK_META[v].short}
        </span>
      )
    },
    {
      title: '',
      key: 'action',
      width: 96,
      align: 'right',
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button type="text" shape="circle" icon={<EyeOutlined />} onClick={() => setDetail(row)} />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'urge', label: '催发货' },
                { key: 'copy', label: '复制订单号' },
                { key: 'blacklist', label: '拉黑客户' },
                { type: 'divider' },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => handleMenu(key, row)
            }}
          >
            <Button type="text" shape="circle" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f6f5fb' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 32px 96px' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1c2333' }}>订单</div>
            <div style={{ color: '#8a91a3', marginTop: 4 }}>掌握每一笔交易的进展</div>
          </div>
          <Space>
            <Button icon={<CloudSyncOutlined />} onClick={() => message.success('已发起 ERP 同步')}>
              同步 ERP
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => message.success('导出任务已提交，请稍后到下载中心查看')}
            >
              导出全部
            </Button>
          </Space>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 22 }}>
          <StatCard label="全部订单" value={counts.ALL} sub={`合计 ${fmtMoney(stats.amount)}`} color="#7c5cfc" bg="#efeaff" />
          <StatCard label="待支付" value={stats.waitPay} color="#d46b08" bg="#fff4e6" />
          <StatCard label="退款中" value={stats.refunding} color="#d4380d" bg="#ffe9e6" />
          <StatCard label="高风险订单" value={stats.highRisk} color="#f5426f" bg="#ffebf1" />
        </div>

        {/* 列表卡片 */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(24,31,67,0.06)', padding: 20 }}>
          <Segmented
            value={statusTab}
            onChange={setStatusTab}
            options={[
              { value: 'ALL', label: `全部 ${counts.ALL ?? ''}` },
              ...STATUS_KEYS.map((k) => ({ value: k, label: `${STATUS_META[k].text} ${counts[k] ?? ''}` }))
            ]}
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <Input
              prefix={<SearchOutlined style={{ color: '#b3b9c9' }} />}
              placeholder="搜索订单号 / 外部交易号 / 客户 / 手机号"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 320 }}
            />
            <Select placeholder="渠道" allowClear value={channel} onChange={setChannel} options={channelOptions} style={{ width: 110 }} />
            <Select placeholder="支付方式" allowClear value={payType} onChange={setPayType} options={payOptions} style={{ width: 120 }} />
            <Select placeholder="风险" allowClear value={riskLevel} onChange={setRiskLevel} options={riskOptions} style={{ width: 110 }} />
            <RangePicker value={dateRange} onChange={setDateRange} />
            <a onClick={resetFilters} style={{ color: '#7c5cfc' }}>
              重置
            </a>
            <span style={{ marginLeft: 'auto', color: '#8a91a3', fontSize: 13 }}>
              {filtered.length} 条结果
            </span>
          </div>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 990 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            onRow={(row) => ({ onDoubleClick: () => setDetail(row) })}
            pagination={{ defaultPageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
          />
        </div>
      </div>

      {/* 选中后浮出的批量操作条 */}
      {selectedKeys.length > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 28,
            transform: 'translateX(-50%)',
            background: '#1c2333',
            color: '#fff',
            borderRadius: 999,
            padding: '10px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            boxShadow: '0 8px 24px rgba(28,35,51,0.35)',
            zIndex: 100
          }}
        >
          <span>
            已选 <b>{selectedKeys.length}</b> 项
          </span>
          <Button size="small" danger type="primary" shape="round" onClick={handleBatchClose}>
            批量关闭
          </Button>
          <a style={{ color: '#9aa1b3' }} onClick={() => setSelectedKeys([])}>
            取消
          </a>
        </div>
      )}

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  )
}

/** 方案 B · 清爽卡片版：现代 SaaS 风格，统计卡片 + 状态页签 + 即时筛选 */
export default function OrdersPageAiry() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7c5cfc',
          borderRadius: 10,
          colorText: '#2a3040',
          colorBgLayout: '#f6f5fb',
          fontSize: 14
        },
        components: {
          Table: { headerBg: '#fff', headerColor: '#8a91a3', rowHoverBg: '#f8f7ff' },
          Segmented: { itemSelectedBg: '#7c5cfc', itemSelectedColor: '#fff', trackBg: '#f0f0f7' }
        }
      }}
    >
      <AntApp>
        <AiryInner />
      </AntApp>
    </ConfigProvider>
  )
}
