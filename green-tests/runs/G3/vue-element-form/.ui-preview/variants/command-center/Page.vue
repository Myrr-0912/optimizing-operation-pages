<template>
  <div class="cc-page">
    <ScenarioBar v-model="scenario" />

    <header class="cc-header">
      <div class="cc-title-wrap">
        <h1>结算配置工作台</h1>
        <span v-if="phase === 'ready' && !isNew" class="cc-sub mono">{{ form.merchantNo }} · {{ form.merchantName || '未命名商户' }}</span>
        <el-tag v-if="phase === 'ready' && isNew" type="warning" size="small">新建商户</el-tag>
      </div>
      <div v-if="phase === 'ready' && !submitted" class="cc-actions">
        <el-popconfirm
          width="300"
          title="将清空全部 29 个字段且不可恢复，确定清空？"
          confirm-button-text="确认清空"
          confirm-button-type="danger"
          cancel-button-text="取消"
          @confirm="handleClear"
        >
          <template #reference>
            <el-button size="small" type="danger" plain>清空重填</el-button>
          </template>
        </el-popconfirm>
        <el-button size="small" type="primary" :loading="saving" @click="handleSubmit">保存配置</el-button>
      </div>
    </header>

    <!-- 加载态 -->
    <div v-if="phase === 'loading'" class="cc-grid">
      <div class="cc-card cc-skel"><el-skeleton animated :rows="6" /></div>
      <div class="cc-card cc-skel"><el-skeleton animated :rows="14" /></div>
      <div class="cc-card cc-skel"><el-skeleton animated :rows="8" /></div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="phase === 'error'" class="cc-state">
      <el-result icon="error" title="结算配置加载失败" :sub-title="loadError">
        <template #extra>
          <el-button type="primary" @click="load">重试</el-button>
        </template>
      </el-result>
    </div>

    <!-- 提交成功 -->
    <div v-else-if="submitted" class="cc-state">
      <el-result icon="success" title="配置已保存" :sub-title="`${savedInfo?.savedAt || ''} · 新配置将从下一结算周期生效`">
        <template #extra>
          <el-button type="primary" @click="submitted = false">继续编辑</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="cc-grid">
      <!-- 左：分组导航 -->
      <aside class="cc-nav">
        <button
          v-for="g in groups"
          :key="g.id"
          class="cc-nav-item"
          :class="{ active: activeId === g.id, err: groupErrors(g) > 0 }"
          type="button"
          @click="scrollTo(g.id)"
        >
          <span class="cc-nav-title">{{ g.title }}</span>
          <span class="cc-nav-meta">
            <em v-if="groupErrors(g) > 0" class="cc-err-badge">{{ groupErrors(g) }} 错</em>
            <span class="mono">{{ countFilled(form, visibleFields(g)) }}/{{ visibleFields(g).length }}</span>
          </span>
        </button>
        <p class="cc-nav-foot">预览使用模拟数据<br />未连接任何真实接口</p>
      </aside>

      <!-- 中：表单 -->
      <main class="cc-main">
        <el-alert
          v-if="isNew"
          type="info"
          show-icon
          :closable="false"
          class="cc-alert"
          title="新建商户：暂无结算配置。右侧面板会随填写实时更新完成度与结算测算。"
        />
        <el-form ref="formRef" :model="form" :rules="formRules" label-position="top" class="cc-form">
          <section v-for="g in groups" :id="'cc-' + g.id" :key="g.id" class="cc-card" :class="{ risk: g.risk }">
            <div class="cc-card-head">
              <h2>{{ g.title }}</h2>
              <span class="cc-desc">{{ g.desc }}</span>
            </div>
            <el-row :gutter="20">
              <el-col v-for="f in visibleFields(g)" :key="f" :span="f === 'remark' || f === 'address' ? 24 : 12">
                <el-form-item :prop="f" :label="fieldLabels[f]">
                  <FieldControl v-model="form[f]" :field="f" :rows="2" :credit-code="f === 'taxNo' ? form.creditCode : null" />
                </el-form-item>
              </el-col>
            </el-row>
          </section>
        </el-form>
      </main>

      <!-- 右：实时摘要 -->
      <aside class="cc-side">
        <div class="cc-kpi-row">
          <div class="cc-kpi">
            <span class="cc-kpi-num mono">{{ completion }}<i>%</i></span>
            <span class="cc-kpi-label">完成度</span>
          </div>
          <div class="cc-kpi" :class="{ warn: missingRequired.length > 0 }">
            <span class="cc-kpi-num mono">{{ missingRequired.length }}</span>
            <span class="cc-kpi-label">必填缺失</span>
          </div>
          <div class="cc-kpi" :class="{ err: errorFields.length > 0 }">
            <span class="cc-kpi-num mono">{{ errorFields.length }}</span>
            <span class="cc-kpi-label">校验错误</span>
          </div>
        </div>
        <el-progress :percentage="completion" :stroke-width="6" :show-text="false" class="cc-progress" />
        <p v-if="missingRequired.length" class="cc-missing">
          待补必填：{{ missingRequired.map((f) => fieldLabels[f]).join('、') }}
        </p>

        <div class="cc-panel">
          <h3>关键结算参数</h3>
          <div class="cc-kv"><span>结算周期</span><el-tag size="small" effect="dark" type="success">{{ optionLabel('settleCycle', form.settleCycle) }}</el-tag></div>
          <div class="cc-kv"><span>结算费率</span><b class="mono cc-green">{{ form.feeRate === '' ? '—' : form.feeRate + ' %' }}</b></div>
          <div class="cc-kv"><span>最低结算金额</span><b class="mono">¥ {{ formatAmount(form.minSettleAmount) }}</b></div>
          <div class="cc-kv"><span>自动提现</span><el-tag size="small" :type="form.autoWithdraw ? 'success' : 'info'" effect="plain">{{ form.autoWithdraw ? '开启' : '关闭' }}</el-tag></div>
          <div class="cc-kv"><span>风控保证金</span><b class="mono cc-amber">¥ {{ formatAmount(form.deposit) }}</b></div>
          <div class="cc-kv"><span>到账账户</span><b class="mono cc-card-no">{{ maskCard(form.bankCardNo) }}</b></div>
        </div>

        <div class="cc-panel">
          <h3>到账测算（示例）</h3>
          <p class="cc-calc-base">假设单笔结算 ¥ 100,000</p>
          <div class="cc-kv"><span>手续费</span><b class="mono cc-amber">¥ {{ demoFee }}</b></div>
          <div class="cc-kv"><span>实际到账</span><b class="mono cc-green">¥ {{ demoNet }}</b></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ScenarioBar from '../../shared/ScenarioBar.vue'
import FieldControl from '../../shared/FieldControl.vue'
import { useSettlement } from '../../shared/useSettlement.js'
import { REQUIRED_FIELDS, countFilled, fieldLabels, formatAmount, formRules, groups, maskCard, optionLabel } from '../../shared/fields.js'

const { scenario, phase, submitted, isNew, saving, loadError, savedInfo, form, load, save, clearAll } = useSettlement()

const formRef = ref()
const activeId = ref(groups[0].id)
const errorFields = ref([])

// 本方案使用 Element Plus 暗色主题，只在本方案挂载期间生效
onMounted(() => document.documentElement.classList.add('dark'))
onBeforeUnmount(() => document.documentElement.classList.remove('dark'))

function visibleFields(g) {
  return g.fields.filter((f) => {
    if ((f === 'invoiceTitle' || f === 'taxNo') && form.invoiceType === 'NONE') return false
    if (f === 'withdrawPhone' && !form.autoWithdraw) return false
    return true
  })
}

const allFields = groups.flatMap((g) => g.fields)
const completion = computed(() => Math.round((countFilled(form, allFields) / allFields.length) * 100))
const missingRequired = computed(() => REQUIRED_FIELDS.filter((f) => String(form[f] ?? '').trim() === ''))

const demoFee = computed(() => {
  const rate = Number(form.feeRate)
  if (form.feeRate === '' || Number.isNaN(rate)) return '—'
  return formatAmount(100000 * (rate / 100))
})
const demoNet = computed(() => {
  const rate = Number(form.feeRate)
  if (form.feeRate === '' || Number.isNaN(rate)) return '—'
  return formatAmount(100000 - 100000 * (rate / 100))
})

function groupErrors(g) {
  return g.fields.filter((f) => errorFields.value.includes(f)).length
}

function scrollTo(id) {
  activeId.value = id
  document.getElementById('cc-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleClear() {
  clearAll()
  errorFields.value = []
  formRef.value?.clearValidate()
  ElMessage.info('已清空，全部字段待填写')
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    errorFields.value = []
  } catch (invalid) {
    errorFields.value = Object.keys(invalid || {})
    const firstGroup = groups.find((g) => groupErrors(g) > 0)
    if (firstGroup) scrollTo(firstGroup.id)
    ElMessage.error(`有 ${errorFields.value.length} 处校验未通过，左侧导航已标出所在分组`)
    return
  }
  await save()
}
</script>

<style scoped>
.cc-page {
  min-height: 100vh;
  background: #0e1116;
  color: #e6e8ee;
  font-size: 13px;
  padding-bottom: 48px;
}
.mono {
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
}
.cc-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: rgba(14, 17, 22, 0.92);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid #232a35;
}
.cc-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.cc-title-wrap h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.cc-sub {
  font-size: 12px;
  color: #8b93a3;
}
.cc-actions {
  display: flex;
  gap: 8px;
}
.cc-grid {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr) 280px;
  gap: 14px;
  max-width: 1280px;
  margin: 14px auto 0;
  padding: 0 24px;
  align-items: start;
}
.cc-state {
  max-width: 720px;
  margin: 64px auto 0;
  background: #161b22;
  border: 1px solid #232a35;
  border-radius: 8px;
}
.cc-card {
  background: #161b22;
  border: 1px solid #232a35;
  border-radius: 8px;
  padding: 14px 18px 4px;
  margin-bottom: 14px;
  scroll-margin-top: 66px;
}
.cc-card.risk {
  border-left: 3px solid #f56c6c;
}
.cc-skel {
  padding: 18px;
}
.cc-card-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #232a35;
}
.cc-card-head h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.cc-desc {
  font-size: 12px;
  color: #6b7385;
}
.cc-alert {
  margin-bottom: 14px;
}
.cc-nav {
  position: sticky;
  top: 66px;
  background: #161b22;
  border: 1px solid #232a35;
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cc-nav-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #aab2c0;
  text-align: left;
  cursor: pointer;
  font-size: 12px;
}
.cc-nav-item:hover {
  background: #1d242e;
}
.cc-nav-item.active {
  background: #1d2a3a;
  border-left-color: #409eff;
  color: #e6e8ee;
}
.cc-nav-item.err {
  border-left-color: #f56c6c;
}
.cc-nav-title {
  font-weight: 500;
}
.cc-nav-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7385;
  font-size: 11px;
}
.cc-err-badge {
  color: #f56c6c;
  font-style: normal;
}
.cc-nav-foot {
  margin: 8px 4px 4px;
  padding-top: 8px;
  border-top: 1px solid #232a35;
  font-size: 11px;
  color: #566072;
  line-height: 1.6;
}
.cc-side {
  position: sticky;
  top: 66px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cc-kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.cc-kpi {
  background: #161b22;
  border: 1px solid #232a35;
  border-radius: 8px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.cc-kpi-num {
  font-size: 24px;
  font-weight: 600;
  color: #4cd6a5;
  line-height: 1;
}
.cc-kpi-num i {
  font-style: normal;
  font-size: 13px;
}
.cc-kpi.warn .cc-kpi-num {
  color: #e6a23c;
}
.cc-kpi.err .cc-kpi-num {
  color: #f56c6c;
}
.cc-kpi-label {
  font-size: 11px;
  color: #8b93a3;
}
.cc-progress {
  margin: -2px 2px 0;
}
.cc-missing {
  margin: 0;
  font-size: 12px;
  color: #e6a23c;
  line-height: 1.6;
}
.cc-panel {
  background: #161b22;
  border: 1px solid #232a35;
  border-radius: 8px;
  padding: 12px 14px;
}
.cc-panel h3 {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #8b93a3;
  letter-spacing: 1px;
}
.cc-kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
  color: #aab2c0;
}
.cc-kv b {
  color: #e6e8ee;
  font-weight: 600;
}
.cc-green {
  color: #4cd6a5 !important;
}
.cc-amber {
  color: #e6a23c !important;
}
.cc-card-no {
  font-size: 11px;
}
.cc-calc-base {
  margin: 0 0 6px;
  font-size: 11px;
  color: #566072;
}
.cc-form :deep(.el-form-item) {
  margin-bottom: 14px;
}
.cc-form :deep(.el-form-item__label) {
  font-size: 12px;
  color: #8b93a3;
  margin-bottom: 2px;
}
</style>
