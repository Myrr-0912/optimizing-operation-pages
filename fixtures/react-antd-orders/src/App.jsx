import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import OrdersPage from './pages/OrdersPage'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <OrdersPage />
    </ConfigProvider>
  )
}
