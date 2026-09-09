import { App } from 'antd'

/**
 * 三套方案共用的操作逻辑（确认文案、成功反馈、数据更新）。
 * 必须在 AntD <App> 内调用，以便 message/modal 跟随各方案主题。
 */
export function useOrderActions({ setRows, setSelectedKeys, reload }) {
  const { message, modal, notification } = App.useApp()

  const remindShip = (row) => {
    if (row.status !== 'PAID') {
      message.warning(`订单 ${row.orderNo} 当前为「非已支付」状态，无需催发货`)
      return
    }
    message.success(`已通知仓库优先发货：${row.orderNo}`)
  }

  const copyOrderNo = async (row) => {
    try {
      await navigator.clipboard.writeText(row.orderNo)
      message.success(`已复制订单号 ${row.orderNo}`)
    } catch {
      message.info(`订单号：${row.orderNo}（浏览器未授权剪贴板，请手动复制）`)
    }
  }

  const deleteOrder = (row) => {
    modal.confirm({
      title: `删除订单 ${row.orderNo}？`,
      content: '删除后不可恢复，客户侧的订单记录将同时消失。如只是不再处理，建议改用"关闭订单"。',
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRows((prev) => prev.filter((d) => d.id !== row.id))
        setSelectedKeys((prev) => prev.filter((k) => k !== row.id))
        message.success(`已删除订单 ${row.orderNo}`)
      }
    })
  }

  const blacklist = (row) => {
    modal.confirm({
      title: `将客户「${row.customerName}」加入黑名单？`,
      content: `${row.customerPhone} 将无法再下单，历史订单不受影响。可在客户管理中移出黑名单。`,
      okText: '确认拉黑',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => message.success(`已将 ${row.customerName}（${row.customerPhone}）加入黑名单`)
    })
  }

  const batchClose = (selectedKeys, rows) => {
    const targets = rows.filter((r) => selectedKeys.includes(r.id))
    const closable = targets.filter((r) => r.status === 'WAIT_PAY' || r.status === 'PAID')
    modal.confirm({
      title: `批量关闭 ${targets.length} 笔订单？`,
      content:
        `选中 ${targets.length} 笔，其中可关闭（待支付/已支付）${closable.length} 笔；` +
        `已发货、退款中等状态订单将被跳过。待支付订单关闭后占用库存立即释放，此操作不可撤销。`,
      okText: `关闭 ${closable.length} 笔`,
      okButtonProps: { danger: true, disabled: closable.length === 0 },
      cancelText: '取消',
      onOk: () => {
        const ids = new Set(closable.map((r) => r.id))
        setRows((prev) => prev.map((d) => (ids.has(d.id) ? { ...d, status: 'CLOSED' } : d)))
        setSelectedKeys([])
        notification.success({
          message: '批量关闭完成',
          description: `成功关闭 ${ids.size} 笔，跳过 ${targets.length - ids.size} 笔（状态不允许）。`
        })
      }
    })
  }

  const exportAll = (count) => {
    notification.success({
      message: '导出任务已提交',
      description: `共 ${count} 条记录，生成完成后可在「下载中心」获取文件。`
    })
  }

  const syncErp = () => {
    reload()
    message.success('已触发 ERP 同步，列表已刷新')
  }

  return { remindShip, copyOrderNo, deleteOrder, blacklist, batchClose, exportAll, syncErp }
}
