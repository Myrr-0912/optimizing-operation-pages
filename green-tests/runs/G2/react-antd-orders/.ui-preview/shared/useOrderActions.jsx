import { App } from 'antd'
import { fmtMoney } from './format'

/**
 * 三套方案共用的操作逻辑：确认文案说明后果、成功态给出明确结果说明。
 * 必须在 antd <App> 上下文内调用（保证 message/modal 跟随各方案主题）。
 * 保留原页面全部业务行为：详情/催发货/复制/删除/拉黑/批量关闭/导出/同步ERP。
 */
export function useOrderActions({ rows, setRows, selectedKeys, setSelectedKeys }) {
  const { message, modal, notification } = App.useApp()

  const urgeShip = (row) => {
    message.success(`已通知仓库优先处理 ${row.orderNo}，催发货记录已生成`)
  }

  const copyOrder = (row) => {
    if (navigator.clipboard) navigator.clipboard.writeText(row.orderNo).catch(() => {})
    message.success(`订单号 ${row.orderNo} 已复制到剪贴板`)
  }

  const blacklist = (row) => {
    modal.confirm({
      title: '将客户加入黑名单？',
      content: `${row.customerName}（${row.customerPhone}）将无法在商城下单，其进行中的订单不受影响。此操作可在客户管理中撤销。`,
      okText: '加入黑名单',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => message.success(`已将 ${row.customerName} 加入黑名单`)
    })
  }

  const removeOrder = (row) => {
    modal.confirm({
      title: '永久删除该订单？',
      content: `订单 ${row.orderNo}（¥ ${fmtMoney(row.amount)}）及其明细将被永久删除，不可恢复。如只是终止交易，请使用「关闭」。`,
      okText: '永久删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRows(rows.filter((d) => d.id !== row.id))
        message.success(`订单 ${row.orderNo} 已删除`)
      }
    })
  }

  const batchClose = () => {
    const n = selectedKeys.length
    if (!n) return
    modal.confirm({
      title: `关闭选中的 ${n} 笔订单？`,
      content: '关闭后订单不可恢复为进行中状态，待支付订单的客户将无法继续支付。',
      okText: `关闭 ${n} 笔`,
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setRows(rows.map((d) => (selectedKeys.includes(d.id) ? { ...d, status: 'CLOSED' } : d)))
        setSelectedKeys([])
        message.success(`已关闭 ${n} 笔订单，可在「已关闭」状态下查看`)
      }
    })
  }

  const exportAll = (count) => {
    notification.success({
      message: '导出任务已提交',
      description: `共 ${count} 条订单（含当前筛选条件）。文件生成后可在「下载中心」获取，一般需要 1-2 分钟。`
    })
  }

  const syncErp = () => {
    const key = 'sync-erp'
    message.loading({ content: '正在与 ERP 同步订单…', key })
    setTimeout(() => message.success({ content: 'ERP 同步完成，共更新 12 条订单状态', key }), 900)
  }

  return { urgeShip, copyOrder, blacklist, removeOrder, batchClose, exportAll, syncErp }
}
