import { useMemo, useState } from 'react'
import {
  App as AntApp,
  Button,
  ConfigProvider,
  DatePicker,
  Divider,
  Dropdown,
  Input,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  theme
} from 'antd'
import {
  CheckCircleFilled,
  DownloadOutlined,
  MinusCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined
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
  fmtTimeShort,
  payOptions,
  riskOptions,
  useOrders
} from './shared'

const { RangePicker } = DatePicker
const MONO = { fontFamily: "Consolas, 'JetBrains Mono', Menlo, monospace" }

function DenseInner() {
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

  const totalAmount = useMemo(() => filtered.reduce((s, r) => s + r.amount, 0), [filtered])

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
      width: 140,
      fixed: 'left',
      render: (v, row) => (
        <a style={{ ...MONO, fontSize: 12 }} onClick={() => setDetail(row)}>
          {v}
        </a>
      )
    },
    {
      title: '外部交易号',
      dataIndex: 'outTradeNo',
      width: 130,
      ellipsis: true,
      render: (v) => (v ? <span style={{ ...MONO, fontSize: 12 }}>{v}</span> : <span style={{ color: '#bbb' }}>—</span>)
    },
    { title: '客户', dataIndex: 'customerName', width: 76 },
    { title: '手机号', dataIndex: 'customerPhone', width: 110, render: (v) => <span style={MONO}>{v}</span> },
    { title: 'SKU', dataIndex: 'skuCount', width: 48, align: 'right' },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 96,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => <span style={{ ...MONO, fontWeight: 600 }}>{v.toFixed(2)}</span>
    },
    {
      title: '优惠',
      dataIndex: 'discount',
      width: 64,
      align: 'right',
      render: (v) => (v ? <span style={{ ...MONO, color: '#d46b08' }}>-{v.toFixed(0)}</span> : <span style={{ color: '#ccc' }}>0</span>)
    },
    {
      title: '运费',
      dataIndex: 'freight',
      width: 56,
      align: 'right',
      render: (v) => (v ? <span style={MONO}>{v}</span> : <span style={{ color: '#0f9d63' }}>包邮</span>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 84,
      render: (v) => (
        <Tag color={STATUS_META[v]?.color} style={{ marginInlineEnd: 0 }}>
          {STATUS_META[v]?.text || v}
        </Tag>
      )
    },
    { title: '渠道', dataIndex: 'channel', width: 68, render: (v) => CHANNEL_TEXT[v] || v },
    { title: '支付', dataIndex: 'payType', width: 82, render: (v) => PAY_TEXT[v] || v },
    {
      title: '同步',
      dataIndex: 'syncFlag',
      width: 52,
      align: 'center',
      render: (v) =>
        v ? (
          <Tooltip title="已同步 ERP">
            <CheckCircleFilled style={{ color: '#52c41a' }} />
          </Tooltip>
        ) : (
          <Tooltip title="未同步 ERP">
            <MinusCircleOutlined style={{ color: '#faad14' }} />
          </Tooltip>
        )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 56,
      align: 'center',
      render: (v) => (
        <span style={{ color: v === 'LOW' ? '#999' : RISK_META[v].dot, fontWeight: v === 'HIGH' ? 700 : 400 }}>
          {RISK_META[v].short}
        </span>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 140,
      ellipsis: true,
      render: (v) => (v ? <Tooltip title={v}>{v}</Tooltip> : <span style={{ color: '#ccc' }}>—</span>)
    },
    {
      title: '创建',
      dataIndex: 'createdAt',
      width: 96,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v) => <span style={{ ...MONO, fontSize: 12 }}>{fmtTimeShort(v)}</span>
    },
    {
      title: '更新',
      dataIndex: 'updatedAt',
      width: 96,
      render: (v) => <span style={{ ...MONO, fontSize: 12, color: '#888' }}>{fmtTimeShort(v)}</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 132,
      render: (_, row) => (
        <Space size={6}>
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
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <style>{`
        .dense-zebra > td { background: #fafbfd; }
        .dense-risk-high > td:first-child { box-shadow: inset 3px 0 0 #f5222d; }
      `}</style>
      <div style={{ padding: '10px 14px' }}>
        {/* 标题 + 全局操作 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>订单管理</span>
          <Divider type="vertical" />
          <span style={{ color: '#889', fontSize: 12 }}>
            {filtered.length} 条 · 合计 <b style={MONO}>{fmtMoney(totalAmount)}</b>
            {selectedKeys.length > 0 && (
              <>
                {' '}
                · 已选 <b>{selectedKeys.length}</b>
              </>
            )}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <Space size={6}>
              <Button size="small" danger disabled={selectedKeys.length === 0} onClick={handleBatchClose}>
                批量关闭
              </Button>
              <Button size="small" icon={<DownloadOutlined />} onClick={() => message.success('导出任务已提交，请稍后到下载中心查看')}>
                导出
              </Button>
              <Button size="small" icon={<SyncOutlined />} onClick={() => message.success('已发起 ERP 同步')}>
                同步 ERP
              </Button>
              <Tooltip title="重新加载">
                <Button size="small" icon={<ReloadOutlined />} onClick={reload} />
              </Tooltip>
            </Space>
          </span>
        </div>

        {/* 筛选工具条：全部即时生效 */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e6e9f0',
            borderRadius: 6,
            padding: '8px 10px',
            marginBottom: 8,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center'
          }}
        >
          <Radio.Group size="small" value={statusTab} onChange={(e) => setStatusTab(e.target.value)} buttonStyle="solid">
            <Radio.Button value="ALL">全部</Radio.Button>
            {STATUS_KEYS.map((k) => (
              <Radio.Button key={k} value={k}>
                {STATUS_META[k].text}
              </Radio.Button>
            ))}
          </Radio.Group>
          <Divider type="vertical" />
          <Input
            size="small"
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            placeholder="订单号/外部单号/客户/手机"
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 220 }}
          />
          <Select size="small" placeholder="渠道" allowClear value={channel} onChange={setChannel} options={channelOptions} style={{ width: 92 }} />
          <Select size="small" placeholder="支付" allowClear value={payType} onChange={setPayType} options={payOptions} style={{ width: 100 }} />
          <Select size="small" placeholder="风险" allowClear value={riskLevel} onChange={setRiskLevel} options={riskOptions} style={{ width: 92 }} />
          <RangePicker size="small" value={dateRange} onChange={setDateRange} style={{ width: 220 }} />
          <a onClick={resetFilters} style={{ fontSize: 12 }}>
            重置
          </a>
        </div>

        {/* 表格 */}
        <Table
          rowKey="id"
          size="small"
          bordered
          sticky
          loading={loading}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 1620 }}
          rowClassName={(row, i) => [i % 2 ? 'dense-zebra' : '', row.riskLevel === 'HIGH' ? 'dense-risk-high' : ''].join(' ')}
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys, columnWidth: 36 }}
          pagination={{
            defaultPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            showSizeChanger: true,
            showQuickJumper: true,
            size: 'small',
            showTotal: (t) => `共 ${t} 条`
          }}
        />
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  )
}

/** 方案 C · 高效紧凑版：紧凑密度 + 斑马纹 + 即时筛选，面向高频操作的运营同学 */
export default function OrdersPageDense() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.compactAlgorithm,
        token: { colorPrimary: '#2f54eb', borderRadius: 4, fontSize: 13 },
        components: { Table: { headerBg: '#eef1f6', cellPaddingBlockSM: 6 } }
      }}
    >
      <AntApp>
        <DenseInner />
      </AntApp>
    </ConfigProvider>
  )
}
