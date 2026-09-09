import dayjs from 'dayjs'

export function fmtMoney(v) {
  return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDateTime(v) {
  return dayjs(v).format('YYYY-MM-DD HH:mm')
}

export function fmtDate(v) {
  return dayjs(v).format('MM-DD HH:mm')
}
