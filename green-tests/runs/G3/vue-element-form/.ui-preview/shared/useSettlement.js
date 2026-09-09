// 三套方案共用的数据加载/保存组合函数（全部走 mock 层）。
import { reactive, ref, watch } from 'vue'
import { blankMerchant, fetchSettlement, saveSettlement } from '../mock/settlement.js'

export function useSettlement() {
  const scenario = ref('normal') // 演示场景：normal | loading | empty | error | success
  const phase = ref('loading') // 页面阶段：loading | ready | error
  const submitted = ref(false) // 是否处于"提交成功"视图
  const isNew = ref(false) // 空数据（新建商户）
  const saving = ref(false)
  const loadError = ref('')
  const savedInfo = ref(null)
  const form = reactive({ ...blankMerchant })

  async function load() {
    phase.value = 'loading'
    submitted.value = false
    loadError.value = ''
    try {
      const effective = scenario.value === 'success' ? 'normal' : scenario.value
      const res = await fetchSettlement(effective)
      Object.assign(form, res.data)
      isNew.value = res.isNew
      phase.value = 'ready'
      if (scenario.value === 'success') {
        savedInfo.value = { merchantNo: form.merchantNo, savedAt: new Date().toLocaleString('zh-CN', { hour12: false }) }
        submitted.value = true
      }
    } catch (e) {
      loadError.value = e.message || '加载失败'
      phase.value = 'error'
    }
  }

  async function save() {
    saving.value = true
    try {
      const res = await saveSettlement({ ...form })
      savedInfo.value = res
      submitted.value = true
      return res
    } finally {
      saving.value = false
    }
  }

  function clearAll() {
    Object.assign(form, blankMerchant)
  }

  watch(scenario, load, { immediate: true })

  return { scenario, phase, submitted, isNew, saving, loadError, savedInfo, form, load, save, clearAll }
}
