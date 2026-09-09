import { useMemo, useState } from 'react'
import {
  App as AntApp,
  Alert,
  Button,
  Card,
  ConfigProvider,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import { DownOutlined, DownloadOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons'
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

function ClassicInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, reload } = useOrders()
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({})
  const [expanded, setExpanded] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters])
  const selectedRows = filtered.filter((r) => selectedKeys.includes(r.id))
  const selectedAmount = selectedRows.reduce((s, r) => s + r.amount, 0)

  function handleSearch() {
    setFilters(form.getFieldsValue())
  }

  function handleReset() {
    form.resetFields()
    setFilters({})
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

  function handleBlacklist(row) {
    modal.confirm({
      title: '拉黑客户',
      content: `确认将客户「${row.customerName}」加入黑名单？该客户将无法继续下单。`,
      okText: '确认拉黑',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk() {
        message.success(`已将 ${row.customerName} 加入黑名单`)
      }
    })
  }

  function handleBatchClose() {
    modal.confirm({
      title: '批量关闭订单',
      content: `确认关闭选中的 ${selectedKeys.length} 个订单？已关闭的订单不会重复处理。`,
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
    else if (key === 'blacklist') handleBlacklist(row)
    else if (key === 'delete') handleDelete(row)
  }

  const columns = [
    {
      title: '订单号 / 外部交易号',
      dataIndex: 'orderNo',
      width: 210,
      render: (v, row) => (
        <>
          <a onClick={() => setDetail(row)} style={{ fontWeight: 500 }}>
            {v}
          </a>
          <div style={{ color: '#999', fontSize: 12, fontFamily: 'Consolas, monospace' }}>
            {row.outTradeNo || '无外部单号'}
          </div>
        </>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 140,
      render: (v, row) => (
        <>
          <div>{v}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{row.customerPhone}</div>
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
          <div style={{ fontWeight: 600 }}>{fmtMoney(v)}</div>
          {row.discount > 0 && <div style={{ color: '#fa8c16', fontSize: 12 }}>优惠 -{fmtMoney(row.discount)}</div>}
        </>
      )
    },
    { title: 'SKU', dataIndex: 'skuCount', width: 70, align: 'center' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => <Tag color={STATUS_META[v]?.color}>{STATUS_META[v]?.text || v}</Tag>
    },
    { title: '渠道', dataIndex: 'channel', width: 90, render: (v) => CHANNEL_TEXT[v] || v },
    { title: '支付方式', dataIndex: 'payType', width: 100, render: (v) => PAY_TEXT[v] || v },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (v) =>
        v === 'LOW' ? (
          <span style={{ color: '#999' }}>低</span>
        ) : (
          <Tag color={RISK_META[v].tag}>{RISK_META[v].text}</Tag>
        )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v) => fmtTime(v)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 190,
      render: (_, row) => (
        <Space size={12}>
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
            <a>
              更多 <DownOutlined style={{ fontSize: 10 }} />
            </a>
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 页头 */}
      <div
        style={{
          background: '#fff',
          padding: '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            订单管理
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            查询、跟进与处理商城全部销售订单
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => message.success('已发起 ERP 同步')}>
            同步 ERP
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.success('导出任务已提交，请稍后到下载中心查看')}>
            导出全部
          </Button>
          <Button icon={<ReloadOutlined />} onClick={reload}>
            刷新
          </Button>
        </Space>
      </div>

      <div style={{ padding: 24 }}>
        {/* 筛选区 */}
        <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 0 } }}>
          <Form form={form} onFinish={handleSearch}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="订单号" name="orderNo">
                  <Input placeholder="请输入订单号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="客户姓名" name="customerName">
                  <Input placeholder="请输入客户姓名" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="订单状态" name="status">
                  <Select placeholder="全部状态" allowClear options={statusOptions} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="下单时间" name="dateRange">
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              {expanded && (
                <>
                  <Col span={6}>
                    <Form.Item label="外部交易号" name="outTradeNo">
                      <Input placeholder="请输入外部交易号" allowClear />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="手机号" name="customerPhone">
                      <Input placeholder="请输入手机号" allowClear />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="下单渠道" name="channel">
                      <Select placeholder="全部渠道" allowClear options={channelOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="支付方式" name="payType">
                      <Select placeholder="全部方式" allowClear options={payOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="风险等级" name="riskLevel">
                      <Select placeholder="全部等级" allowClear options={riskOptions} />
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Form.Item>
                  <Space>
                    <Button onClick={handleReset}>重置</Button>
                    <Button type="primary" htmlType="submit">
                      查询
                    </Button>
                    <a onClick={() => setExpanded(!expanded)}>
                      {expanded ? '收起' : '展开'} <DownOutlined rotate={expanded ? 180 : 0} style={{ fontSize: 10 }} />
                    </a>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 列表区 */}
        <Card
          title={
            <Space>
              订单列表
              <Typography.Text type="secondary" style={{ fontWeight: 'normal', fontSize: 13 }}>
                共 {filtered.length} 条
              </Typography.Text>
            </Space>
          }
          extra={
            <Button danger disabled={selectedKeys.length === 0} onClick={handleBatchClose}>
              批量关闭{selectedKeys.length > 0 ? `（${selectedKeys.length}）` : ''}
            </Button>
          }
        >
          {selectedKeys.length > 0 && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message={
                <Space size={16}>
                  <span>
                    已选择 <b>{selectedKeys.length}</b> 项，金额合计 <b>{fmtMoney(selectedAmount)}</b>
                  </span>
                  <a onClick={() => setSelectedKeys([])}>取消选择</a>
                </Space>
              }
            />
          )}
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1270 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`
            }}
          />
        </Card>
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
    </div>
  )
}

/** 方案 A · 经典专业版：Ant Design Pro 风格，标准企业后台布局 */
export default function OrdersPageClassic() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <AntApp>
        <ClassicInner />
      </AntApp>
    </ConfigProvider>
  )
}
