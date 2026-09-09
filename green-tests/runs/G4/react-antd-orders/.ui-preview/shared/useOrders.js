import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchOrders } from '../mock/orders.js'

/**
 * 三套方案共用的数据 hook。
 * scenario: 'normal' | 'empty' | 'error' —— 由 ScenarioBar 切换，演示五种页面状态。
 */
export function useOrders() {
  const [scenario, setScenario] = useState('normal')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const seq = useRef(0)

  const load = useCallback((sc) => {
    const ticket = ++seq.current
    setLoading(true)
    setError(null)
    fetchOrders({ scenario: sc })
      .then((rows) => {
        if (ticket !== seq.current) return
        setData(rows)
        setLoading(false)
      })
      .catch((err) => {
        if (ticket !== seq.current) return
        setData([])
        setError(err.message || '加载失败')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    load(scenario)
  }, [scenario, load])

  return {
    data,
    setData,
    loading,
    error,
    scenario,
    setScenario,
    reload: () => load(scenario)
  }
}
