import dayjs from 'dayjs'

/** 金额：千分位 + 两位小数（配合 CSS tabular-nums 使用） */
export function fmtMoney(v) {
  return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDateTime(v) {
  return dayjs(v).format('YYYY-MM-DD HH:mm:ss')
}

export function fmtDate(v) {
  return dayjs(v).format('MM-DD HH:mm')
}
