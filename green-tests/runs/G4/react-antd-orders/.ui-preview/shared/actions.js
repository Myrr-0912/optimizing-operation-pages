import { copyText } from './dict.js'

// 三套方案共用的业务动作实现（预览环境全部为模拟行为，不调用任何真实接口）。
// modal / message 来自各方案内 App.useApp()，保证跟随各自主题。

export function urgeShip(message, row) {
  message.success(`已通知仓库优先发货：${row.orderNo}`)
}

export function copyOrderNo(message, row) {
  copyText(row.orderNo).then((ok) => {
    message.success(ok ? `已复制订单号 ${row.orderNo}` : `订单号：${row.orderNo}（请手动复制）`)
  })
}

export function confirmDelete(modal, message, row, onDone) {
  modal.confirm({
    title: '删除订单',
    content: `将永久删除订单 ${row.orderNo}（${row.customerName}），删除后不可恢复，关联的售后与对账记录将无法追溯。`,
    okText: '确认删除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => {
      onDone()
      message.success(`订单 ${row.orderNo} 已删除`)
    }
  })
}

export function confirmBlacklist(modal, message, row) {
  modal.confirm({
    title: '将客户加入黑名单',
    content: `将 ${row.customerName}（${row.customerPhone.slice(0, 3)}****${row.customerPhone.slice(7)}）加入黑名单后，该客户后续下单将被自动拦截。可在「客户管理 · 黑名单」中移除。`,
    okText: '确认拉黑',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => message.success(`已将 ${row.customerName} 加入黑名单`)
  })
}

export function confirmBatchClose(modal, message, count, onDone) {
  modal.confirm({
    title: `批量关闭 ${count} 笔订单`,
    content: '选中订单的状态将统一置为「已关闭」，买家将无法继续支付。此操作不可撤销，确定继续？',
    okText: `关闭 ${count} 笔`,
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => {
      onDone()
      message.success(`已关闭 ${count} 笔订单`)
    }
  })
}

export function exportAll(message, count) {
  message.success(`导出任务已提交（${count} 条），完成后可在「下载中心」获取文件`)
}

export function syncErp(message) {
  message.success('已触发 ERP 同步，同步结果将以站内信通知')
}
