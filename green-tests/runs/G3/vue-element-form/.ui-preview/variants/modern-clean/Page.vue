<template>
  <div class="mc-page">
    <ScenarioBar v-model="scenario" />

    <div class="mc-container">
      <header class="mc-header">
        <h1>商户结算配置</h1>
        <p class="mc-sub">分四步完成填写，最后一步核对关键结算信息后提交</p>
      </header>

      <!-- 加载态 -->
      <el-card v-if="phase === 'loading'" class="mc-card" shadow="never">
        <el-skeleton animated :rows="10" />
      </el-card>

      <!-- 加载失败 -->
      <el-card v-else-if="phase === 'error'" class="mc-card" shadow="never">
        <el-result icon="error" title="结算配置加载失败" :sub-title="loadError">
          <template #extra>
            <el-button type="primary" round @click="load">重试</el-button>
          </template>
        </el-result>
      </el-card>

      <!-- 提交成功 -->
      <el-card v-else-if="submitted" class="mc-card" shadow="never">
        <el-result icon="success" title="结算配置已提交" :sub-title="`${savedInfo?.merchantNo || form.merchantNo} · ${savedInfo?.savedAt || ''}`">
          <template #extra>
            <el-button type="primary" round @click="editAgain">继续编辑本商户</el-button>
            <el-button round @click="startBlank">配置下一家商户</el-button>
          </template>
        </el-result>
        <div class="mc-key-cards mc-key-cards--result">
          <div class="mc-key"><span>结算周期</span><strong>{{ optionLabel('settleCycle', form.settleCycle) }}</strong></div>
          <div class="mc-key"><span>结算费率</span><strong>{{ form.feeRate === '' ? '—' : form.feeRate + '%' }}</strong></div>
          <div class="mc-key"><span>到账卡号</span><strong class="mono">{{ maskCard(form.bankCardNo) }}</strong></div>
          <div class="mc-key"><span>自动提现</span><strong>{{ form.autoWithdraw ? '开启' : '关闭' }}</strong></div>
        </div>
      </el-card>

      <template v-else>
        <el-steps :active="step" align-center finish-status="success" class="mc-steps">
          <el-step v-for="(s, i) in stepTitles" :key="s" :title="s" class="mc-step" @click="jumpTo(i)" />
        </el-steps>

        <el-alert
          v-if="isNew && step === 0"
          type="info"
          show-icon
          :closable="false"
          class="mc-alert"
          title="新建商户：还没有任何结算配置，从商户与法人信息开始填写。"
        />

        <el-card class="mc-card" shadow="never">
          <el-form ref="formRef" :model="form" :rules="formRules" label-position="top">
            <!-- 第 1 步：商户与法人 -->
            <div v-show="step === 0">
              <template v-for="gid in stepGroups[0]" :key="gid">
                <h3 class="mc-group-title">{{ groupById(gid).title }}</h3>
                <el-row :gutter="28">
                  <el-col v-for="f in visibleFields(groupById(gid))" :key="f" :span="wideFields.includes(f) ? 24 : 12">
                    <el-form-item :prop="f" :label="fieldLabels[f]">
                      <FieldControl v-model="form[f]" :field="f" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
            </div>

            <!-- 第 2 步：结算账户 -->
            <div v-show="step === 1">
              <el-alert
                type="warning"
                show-icon
                :closable="false"
                class="mc-alert"
                title="结算款将打入以下账户，卡号或联行号填错会导致结算失败，请仔细核对。"
              />
              <h3 class="mc-group-title">{{ groupById('account').title }}</h3>
              <el-row :gutter="28">
                <el-col v-for="f in groupById('account').fields" :key="f" :span="wideFields.includes(f) ? 24 : 12">
                  <el-form-item :prop="f" :label="fieldLabels[f]">
                    <FieldControl v-model="form[f]" :field="f" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 第 3 步：规则与发票 -->
            <div v-show="step === 2">
              <template v-for="gid in ['rules', 'invoice', 'remark']" :key="gid">
                <h3 class="mc-group-title">{{ groupById(gid).title }}</h3>
                <el-row :gutter="28">
                  <el-col v-for="f in visibleFields(groupById(gid))" :key="f" :span="wideFields.includes(f) ? 24 : 12">
                    <el-form-item :prop="f" :label="fieldLabels[f]">
                      <FieldControl v-model="form[f]" :field="f" :credit-code="f === 'taxNo' ? form.creditCode : null" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
            </div>

            <!-- 第 4 步：核对提交 -->
            <div v-show="step === 3">
              <el-alert
                type="warning"
                show-icon
                :closable="false"
                class="mc-alert"
                title="请核对以下关键结算信息，提交后将按新配置结算打款。"
              />
              <div class="mc-key-cards">
                <div class="mc-key"><span>结算周期</span><strong>{{ optionLabel('settleCycle', form.settleCycle) }}</strong></div>
                <div class="mc-key"><span>结算费率</span><strong>{{ form.feeRate === '' ? '—' : form.feeRate + '%' }}</strong></div>
                <div class="mc-key"><span>到账卡号</span><strong class="mono">{{ maskCard(form.bankCardNo) }}</strong></div>
                <div class="mc-key"><span>自动提现</span><strong>{{ form.autoWithdraw ? '开启' : '关闭' }}</strong></div>
              </div>
              <template v-for="g in groups" :key="g.id">
                <h3 class="mc-group-title">{{ g.title }}</h3>
                <el-descriptions :column="2" size="small" class="mc-desc">
                  <el-descriptions-item v-for="f in visibleFields(g)" :key="f" :label="fieldLabels[f]">
                    {{ displayValue(f) }}
                  </el-descriptions-item>
                </el-descriptions>
              </template>
              <el-checkbox v-model="confirmed" class="mc-confirm">我已核对结算账户与费率无误</el-checkbox>
            </div>
          </el-form>

          <div class="mc-nav">
            <el-button v-if="step > 0" round @click="step--">上一步</el-button>
            <span v-else></span>
            <div class="mc-nav-right">
              <el-popconfirm
                width="300"
                title="将清空全部 29 个字段且不可恢复，确定清空？"
                confirm-button-text="确认清空"
                confirm-button-type="danger"
                cancel-button-text="取消"
                @confirm="handleClear"
              >
                <template #reference>
                  <el-button text type="danger">清空重填</el-button>
                </template>
              </el-popconfirm>
              <el-button v-if="step < 3" type="primary" round @click="next">下一步</el-button>
              <el-button v-else type="primary" round :disabled="!confirmed" :loading="saving" @click="handleSubmit">
                确认提交
              </el-button>
            </div>
          </div>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ScenarioBar from '../../shared/ScenarioBar.vue'
import FieldControl from '../../shared/FieldControl.vue'
import { useSettlement } from '../../shared/useSettlement.js'
import { fieldLabels, formRules, groups, maskCard, optionLabel, options } from '../../shared/fields.js'

const { scenario, phase, submitted, isNew, saving, loadError, savedInfo, form, load, save, clearAll } = useSettlement()

const formRef = ref()
const step = ref(0)
const confirmed = ref(false)
const stepTitles = ['商户与法人', '结算账户', '规则与发票', '核对提交']
const stepGroups = [['basic', 'legal', 'address'], ['account'], ['rules', 'invoice', 'remark'], []]
const wideFields = ['merchantName', 'creditCode', 'contactEmail', 'address', 'accountName', 'branchName', 'invoiceTitle', 'remark']

const groupById = (id) => groups.find((g) => g.id === id)

// 切换演示场景重新加载数据时，向导回到第一步
watch(phase, (p) => {
  if (p === 'loading') {
    step.value = 0
    confirmed.value = false
  }
})

// 渐进披露：不开票时收起发票抬头/税号；关闭自动提现时收起预留手机号（值都保留）
function visibleFields(g) {
  return g.fields.filter((f) => {
    if ((f === 'invoiceTitle' || f === 'taxNo') && form.invoiceType === 'NONE') return false
    if (f === 'withdrawPhone' && !form.autoWithdraw) return false
    return true
  })
}

function displayValue(f) {
  if (f === 'autoWithdraw') return form.autoWithdraw ? '开启' : '关闭'
  if (options[f]) return optionLabel(f, form[f])
  const v = String(form[f] ?? '').trim()
  return v === '' ? '—' : v
}

function fieldsOfStep(i) {
  return stepGroups[i].flatMap((gid) => visibleFields(groupById(gid)))
}

async function next() {
  try {
    await formRef.value.validateField(fieldsOfStep(step.value))
    step.value += 1
  } catch {
    ElMessage.error('请先修正本步骤中标红的校验错误')
  }
}

function jumpTo(i) {
  if (i < step.value) step.value = i // 只允许回到已完成的步骤
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch (invalid) {
    const bad = Object.keys(invalid || {})
    const idx = stepGroups.findIndex((gids) => gids.some((gid) => groupById(gid).fields.some((f) => bad.includes(f))))
    if (idx > -1) step.value = idx
    ElMessage.error(`有 ${bad.length} 处校验未通过，已跳回对应步骤`)
    return
  }
  await save()
  ElMessage.success('提交成功')
}

function editAgain() {
  submitted.value = false
  step.value = 0
  confirmed.value = false
}

function startBlank() {
  clearAll()
  submitted.value = false
  isNew.value = true
  step.value = 0
  confirmed.value = false
  formRef.value?.clearValidate()
}

function handleClear() {
  clearAll()
  confirmed.value = false
  step.value = 0
  formRef.value?.clearValidate()
  ElMessage.info('已清空，全部字段待填写')
}
</script>

<style scoped>
.mc-page {
  min-height: 100vh;
  background: #f6f8fa;
  padding: 56px 0 64px;
  font-size: 14px;
}
.mono {
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
}
.mc-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}
.mc-header {
  text-align: center;
  margin-bottom: 24px;
}
.mc-header h1 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2329;
}
.mc-sub {
  margin: 0;
  color: #8a919f;
  font-size: 13px;
}
.mc-steps {
  margin-bottom: 20px;
}
.mc-step {
  cursor: pointer;
}
.mc-alert {
  margin-bottom: 16px;
  border-radius: 10px;
}
.mc-card {
  border-radius: 14px;
  border: none;
  box-shadow: 0 1px 3px rgba(31, 35, 41, 0.06);
  padding: 8px;
}
.mc-group-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
  margin: 8px 0 16px;
  padding-left: 10px;
  border-left: 3px solid var(--el-color-primary);
}
.mc-key-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.mc-key-cards--result {
  max-width: 640px;
  margin: 0 auto 16px;
}
.mc-key {
  background: #f6f8fa;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mc-key span {
  font-size: 12px;
  color: #8a919f;
}
.mc-key strong {
  font-size: 15px;
  color: #1f2329;
  word-break: break-all;
}
.mc-desc {
  margin-bottom: 8px;
}
.mc-confirm {
  margin-top: 8px;
}
.mc-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}
.mc-nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
:deep(.el-form-item) {
  margin-bottom: 20px;
}
:deep(.el-form-item__label) {
  color: #4e5969;
  font-size: 13px;
  margin-bottom: 4px;
}
</style>
