<template>
  <div class="page">
    <div class="page-card">
      <div class="page-header">
        <h2>商户结算配置</h2>
        <p>分步填写，实时校验，内容自动保存草稿，中途离开也不会丢失</p>
      </div>

      <el-steps :active="active" align-center finish-status="success" class="steps">
        <el-step
          v-for="(s, i) in STEPS"
          :key="s.title"
          :title="s.title"
          :class="{ 'step-clickable': i < active }"
          @click="i < active && (active = i)"
        />
      </el-steps>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
        label-width="140px"
        scroll-to-error
        class="form-body"
      >
        <!-- 第 1 步：商户信息 -->
        <div v-show="active === 0">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="商户编号" prop="merchantNo">
                <el-input v-model="form.merchantNo" placeholder="如：M20260455" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户类型" prop="merchantType">
                <el-select v-model="form.merchantType" placeholder="请选择商户类型">
                  <el-option v-for="o in merchantTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户名称" prop="merchantName">
                <el-input v-model="form.merchantName" placeholder="营业执照上的完整名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商户简称" prop="shortName">
                <el-input v-model="form.shortName" placeholder="将展示给消费者，建议 2~8 个字" maxlength="16" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="统一社会信用代码"
                prop="creditCode"
                :extra="form.merchantType === 'MICRO' ? '小微商户无营业执照可不填' : ''"
              >
                <el-input v-model="form.creditCode" placeholder="18 位，与营业执照一致" maxlength="18" show-word-limit clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="行业类目" prop="industry">
                <el-select v-model="form.industry" placeholder="请选择行业类目">
                  <el-option v-for="o in industryOptions" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="经营省市区" prop="region">
                <el-input v-model="form.region" placeholder="如：浙江省杭州市西湖区" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="经营详细地址" prop="address">
                <el-input v-model="form.address" placeholder="街道、门牌号、楼层等" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 第 2 步：法人与联系人 -->
        <div v-show="active === 1">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="法人姓名" prop="legalName">
                <el-input v-model="form.legalName" placeholder="与身份证一致" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法人身份证号" prop="legalIdNo">
                <el-input v-model="form.legalIdNo" placeholder="18 位身份证号" maxlength="18" show-word-limit clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法人手机号" prop="legalPhone">
                <el-input v-model="form.legalPhone" placeholder="11 位手机号" maxlength="11" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系邮箱" prop="contactEmail">
                <el-input v-model="form.contactEmail" placeholder="用于接收结算通知" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="客服电话" prop="servicePhone">
                <el-input v-model="form.servicePhone" placeholder="选填，手机号或区号-座机号" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 第 3 步：结算账户 -->
        <div v-show="active === 2">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="step-alert"
            title="对公账户的开户名称须与商户名称一致，法人个人账户须与法人姓名一致，已为您自动带入"
          />
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="结算账户类型" prop="accountType">
                <el-select v-model="form.accountType" placeholder="请选择账户类型">
                  <el-option v-for="o in accountTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户名称" prop="accountName">
                <el-input v-model="form.accountName" placeholder="银行开户名称" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡号" prop="bankCardNo">
                <el-input
                  v-model="form.bankCardNo"
                  placeholder="仅数字，自动分组便于核对"
                  :formatter="cardFormatter"
                  :parser="cardParser"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户银行" prop="bankName">
                <el-input v-model="form.bankName" placeholder="如：招商银行" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开户支行" prop="branchName">
                <el-input v-model="form.branchName" placeholder="如：招商银行杭州文三支行" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联行号" prop="bankCode">
                <el-input v-model="form.bankCode" placeholder="12 位数字，可咨询开户行" maxlength="12" show-word-limit clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 第 4 步：结算与发票 -->
        <div v-show="active === 3">
          <el-divider content-position="left">结算规则</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="结算周期" prop="settleCycle">
                <el-select v-model="form.settleCycle" placeholder="请选择结算周期">
                  <el-option v-for="o in settleCycleOptions" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结算费率（%）" prop="feeRate">
                <el-input-number v-model="form.feeRate" :min="0" :max="100" :step="0.1" :precision="2" controls-position="right" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最低结算金额（元）" prop="minSettleAmount">
                <el-input-number v-model="form.minSettleAmount" :min="0" :step="100" :precision="2" controls-position="right" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="风控保证金（元）" prop="deposit" extra="选填，未缴纳可留空">
                <el-input-number v-model="form.deposit" :min="0" :step="1000" :precision="2" controls-position="right" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">提现设置</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="是否自动提现" prop="autoWithdraw" extra="开启后结算金额将自动提现至结算账户">
                <el-switch v-model="form.autoWithdraw" active-text="开启" inactive-text="关闭" />
              </el-form-item>
            </el-col>
            <el-col v-if="form.autoWithdraw" :span="12">
              <el-form-item label="提现预留手机号" prop="withdrawPhone">
                <el-input v-model="form.withdrawPhone" placeholder="接收提现短信通知" maxlength="11" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">发票信息</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发票类型" prop="invoiceType">
                <el-select v-model="form.invoiceType" placeholder="请选择发票类型">
                  <el-option v-for="o in invoiceTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <template v-if="form.invoiceType && form.invoiceType !== 'NONE'">
              <el-col :span="12">
                <el-form-item label="发票抬头" prop="invoiceTitle">
                  <el-input v-model="form.invoiceTitle" placeholder="一般与商户名称一致" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纳税人识别号" prop="taxNo">
                  <el-input v-model="form.taxNo" placeholder="一般与统一社会信用代码一致" maxlength="20" clearable />
                </el-form-item>
              </el-col>
            </template>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="选填" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 第 5 步：确认提交 -->
        <div v-if="active === 4" class="review">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="step-alert"
            title="请核对以下配置信息，确认无误后提交；如需调整可点击各分组右侧的「修改」"
          />
          <div v-for="group in reviewGroups" :key="group.title" class="review-group">
            <div class="review-head">
              <span class="review-title">{{ group.title }}</span>
              <el-button link type="primary" @click="active = group.step">修改</el-button>
            </div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item v-for="item in group.items" :key="item.key" :label="item.label" label-class-name="review-label">
                {{ displayValue(item.key) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-form>

      <div class="footer">
        <span class="draft-tip">{{ draftSavedAt ? `草稿已自动保存 ${draftSavedAt}` : '' }}</span>
        <div>
          <el-button v-if="active > 0" @click="active--">上一步</el-button>
          <el-button v-if="active < 4" type="primary" @click="next">下一步</el-button>
          <el-button v-if="active === 4" type="primary" :loading="submitting" @click="submit">提交配置</el-button>
          <el-button type="danger" plain @click="reset">清空重填</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* ---------- 步骤与选项 ---------- */
const STEPS = [
  { title: '商户信息' },
  { title: '法人与联系人' },
  { title: '结算账户' },
  { title: '结算与发票' },
  { title: '确认提交' }
]

const STEP_FIELDS = [
  ['merchantNo', 'merchantName', 'shortName', 'merchantType', 'creditCode', 'industry', 'region', 'address'],
  ['legalName', 'legalIdNo', 'legalPhone', 'contactEmail', 'servicePhone'],
  ['accountType', 'accountName', 'bankCardNo', 'bankName', 'branchName', 'bankCode'],
  ['settleCycle', 'feeRate', 'minSettleAmount', 'deposit', 'autoWithdraw', 'withdrawPhone', 'invoiceType', 'invoiceTitle', 'taxNo', 'remark']
]

const merchantTypeOptions = [
  { label: '企业', value: 'COMPANY' },
  { label: '个体工商户', value: 'INDIVIDUAL' },
  { label: '小微商户', value: 'MICRO' }
]
const industryOptions = [
  { label: '食品生鲜', value: 'FOOD' },
  { label: '服饰箱包', value: 'CLOTHES' },
  { label: '数码家电', value: 'DIGITAL' },
  { label: '本地生活', value: 'LOCAL' }
]
const accountTypeOptions = [
  { label: '对公账户', value: 'CORPORATE' },
  { label: '法人个人账户', value: 'PERSONAL' }
]
const settleCycleOptions = [
  { label: 'T+1（次日到账）', value: 'T1' },
  { label: 'T+7', value: 'T7' },
  { label: '月结', value: 'MONTH' }
]
const invoiceTypeOptions = [
  { label: '增值税专用发票', value: 'SPECIAL' },
  { label: '增值税普通发票', value: 'NORMAL' },
  { label: '不开票', value: 'NONE' }
]

const OPTION_LABELS = {
  merchantType: merchantTypeOptions,
  industry: industryOptions,
  accountType: accountTypeOptions,
  settleCycle: settleCycleOptions,
  invoiceType: invoiceTypeOptions
}

/* ---------- 表单数据 ---------- */
const initialData = {
  merchantNo: 'M20260455',
  merchantName: '杭州云栖优选贸易有限公司',
  shortName: '云栖优选',
  merchantType: 'COMPANY',
  creditCode: '91330106MA2CE55X0K',
  legalName: '沈立群',
  legalIdNo: '330106198804122417',
  legalPhone: '13957112288',
  contactEmail: 'finance@yunqi-mall.example.com',
  servicePhone: '0571-88221100',
  region: '浙江省杭州市西湖区',
  address: '文三西路 518 号云栖产业园 B 座 11 层',
  industry: 'FOOD',
  accountType: 'CORPORATE',
  accountName: '杭州云栖优选贸易有限公司',
  bankCardNo: '571908822110045678',
  bankName: '招商银行',
  branchName: '招商银行杭州文三支行',
  bankCode: '308331000516',
  settleCycle: 'T1',
  feeRate: 0.6,
  minSettleAmount: 100,
  invoiceType: 'SPECIAL',
  invoiceTitle: '杭州云栖优选贸易有限公司',
  taxNo: '91330106MA2CE55X0K',
  autoWithdraw: true,
  withdrawPhone: '13957112288',
  deposit: 20000,
  remark: ''
}

function blankForm() {
  const blank = {}
  Object.keys(initialData).forEach((k) => {
    const v = initialData[k]
    blank[k] = typeof v === 'boolean' ? false : typeof v === 'number' ? null : ''
  })
  return blank
}

const form = reactive({ ...initialData })
const formRef = ref()
const active = ref(0)
const submitting = ref(false)

/* ---------- 校验规则 ---------- */
const MOBILE_RE = /^1[3-9]\d{9}$/
const rules = computed(() => ({
  merchantNo: [{ required: true, message: '请输入商户编号', trigger: 'blur' }],
  merchantName: [{ required: true, message: '请输入商户名称', trigger: 'blur' }],
  shortName: [{ required: true, message: '请输入商户简称', trigger: 'blur' }],
  merchantType: [{ required: true, message: '请选择商户类型', trigger: 'change' }],
  creditCode: [
    { required: form.merchantType !== 'MICRO', message: '请输入统一社会信用代码', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '应为 18 位统一社会信用代码', trigger: 'blur' }
  ],
  industry: [{ required: true, message: '请选择行业类目', trigger: 'change' }],
  region: [{ required: true, message: '请输入经营省市区', trigger: 'blur' }],
  address: [{ required: true, message: '请输入经营详细地址', trigger: 'blur' }],
  legalName: [{ required: true, message: '请输入法人姓名', trigger: 'blur' }],
  legalIdNo: [
    { required: true, message: '请输入法人身份证号', trigger: 'blur' },
    {
      pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
      message: '身份证号格式不正确（18 位）',
      trigger: 'blur'
    }
  ],
  legalPhone: [
    { required: true, message: '请输入法人手机号', trigger: 'blur' },
    { pattern: MOBILE_RE, message: '手机号格式不正确', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  servicePhone: [
    { pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/, message: '请输入手机号或“区号-座机号”', trigger: 'blur' }
  ],
  accountType: [{ required: true, message: '请选择结算账户类型', trigger: 'change' }],
  accountName: [{ required: true, message: '请输入开户名称', trigger: 'blur' }],
  bankCardNo: [
    { required: true, message: '请输入银行卡号', trigger: 'blur' },
    { pattern: /^\d{9,30}$/, message: '银行卡号应为 9~30 位数字', trigger: 'blur' }
  ],
  bankName: [{ required: true, message: '请输入开户银行', trigger: 'blur' }],
  branchName: [{ required: true, message: '请输入开户支行', trigger: 'blur' }],
  bankCode: [
    { required: true, message: '请输入联行号', trigger: 'blur' },
    { pattern: /^\d{12}$/, message: '联行号应为 12 位数字', trigger: 'blur' }
  ],
  settleCycle: [{ required: true, message: '请选择结算周期', trigger: 'change' }],
  feeRate: [{ required: true, message: '请输入结算费率', trigger: 'blur' }],
  minSettleAmount: [{ required: true, message: '请输入最低结算金额', trigger: 'blur' }],
  invoiceType: [{ required: true, message: '请选择发票类型', trigger: 'change' }],
  invoiceTitle: [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
  taxNo: [
    { required: true, message: '请输入纳税人识别号', trigger: 'blur' },
    { pattern: /^[0-9A-Z]{15,20}$/, message: '纳税人识别号应为 15~20 位数字或大写字母', trigger: 'blur' }
  ],
  withdrawPhone: [
    { required: true, message: '请输入提现预留手机号', trigger: 'blur' },
    { pattern: MOBILE_RE, message: '手机号格式不正确', trigger: 'blur' }
  ]
}))

/* 银行卡号输入时每 4 位分组显示，便于核对；实际值不含空格 */
const cardFormatter = (v) => String(v).replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
const cardParser = (v) => String(v).replace(/\D/g, '')

/* ---------- 关联字段自动带入，减少重复录入 ---------- */
watch(
  () => form.accountType,
  (val) => {
    if (!val) return
    const expected = val === 'CORPORATE' ? form.merchantName : form.legalName
    // 仅在开户名称为空、或仍是另一种自动带入值时覆盖，避免破坏手动修改
    if (!form.accountName || form.accountName === form.merchantName || form.accountName === form.legalName) {
      form.accountName = expected
    }
  }
)
watch(
  () => form.invoiceType,
  (val) => {
    if (val === 'SPECIAL' || val === 'NORMAL') {
      if (!form.invoiceTitle) form.invoiceTitle = form.merchantName
      if (!form.taxNo) form.taxNo = form.creditCode
    }
  }
)
watch(
  () => form.autoWithdraw,
  (val) => {
    if (val && !form.withdrawPhone) form.withdrawPhone = form.legalPhone
  }
)

/* ---------- 草稿自动保存 ---------- */
const DRAFT_KEY = 'merchant-settlement-draft'
const draftSavedAt = ref('')
let draftTimer = null
let skipDraftOnce = false

watch(
  form,
  () => {
    if (skipDraftOnce) {
      skipDraftOnce = false
      return
    }
    clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: { ...form }, time: Date.now() }))
      draftSavedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    }, 500)
  },
  { deep: true }
)

onMounted(() => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const { data, time } = JSON.parse(raw)
    if (data && typeof data === 'object') {
      Object.assign(form, data)
      draftSavedAt.value = new Date(time).toLocaleTimeString('zh-CN', { hour12: false })
      ElMessage.info('已恢复上次自动保存的草稿')
    }
  } catch {
    localStorage.removeItem(DRAFT_KEY)
  }
})

/* ---------- 步骤流转 ---------- */
function visibleFields(stepIdx) {
  return STEP_FIELDS[stepIdx].filter((f) => {
    if ((f === 'invoiceTitle' || f === 'taxNo') && (!form.invoiceType || form.invoiceType === 'NONE')) return false
    if (f === 'withdrawPhone' && !form.autoWithdraw) return false
    return true
  })
}

async function next() {
  try {
    await formRef.value.validateField(visibleFields(active.value))
    active.value++
  } catch {
    ElMessage.warning('请先完善本步骤中标红的字段')
  }
}

function submit() {
  formRef.value.validate(async (valid, invalidFields) => {
    if (!valid) {
      const firstField = Object.keys(invalidFields)[0]
      const stepIdx = STEP_FIELDS.findIndex((fields) => fields.includes(firstField))
      if (stepIdx >= 0) active.value = stepIdx
      ElMessage.error('还有信息未完善，已为您定位到对应步骤')
      return
    }
    submitting.value = true
    await new Promise((resolve) => setTimeout(resolve, 600)) // 模拟接口提交
    submitting.value = false
    localStorage.removeItem(DRAFT_KEY)
    skipDraftOnce = true
    draftSavedAt.value = ''
    ElMessage.success('结算配置保存成功')
  })
}

function reset() {
  ElMessageBox.confirm('确定要清空所有已填写的内容吗？', '清空确认', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      skipDraftOnce = true
      Object.assign(form, blankForm())
      localStorage.removeItem(DRAFT_KEY)
      draftSavedAt.value = ''
      active.value = 0
      // setTimeout 确保在选择器等组件的异步校验完成后再清除校验状态
      setTimeout(() => formRef.value?.clearValidate(), 0)
      ElMessage.success('已清空，可重新填写')
    })
    .catch(() => {})
}

/* ---------- 确认页 ---------- */
const reviewGroups = computed(() => {
  const groups = [
    {
      title: '商户信息',
      step: 0,
      items: [
        { label: '商户编号', key: 'merchantNo' },
        { label: '商户类型', key: 'merchantType' },
        { label: '商户名称', key: 'merchantName' },
        { label: '商户简称', key: 'shortName' },
        { label: '统一社会信用代码', key: 'creditCode' },
        { label: '行业类目', key: 'industry' },
        { label: '经营省市区', key: 'region' },
        { label: '经营详细地址', key: 'address' }
      ]
    },
    {
      title: '法人与联系人',
      step: 1,
      items: [
        { label: '法人姓名', key: 'legalName' },
        { label: '法人身份证号', key: 'legalIdNo' },
        { label: '法人手机号', key: 'legalPhone' },
        { label: '联系邮箱', key: 'contactEmail' },
        { label: '客服电话', key: 'servicePhone' }
      ]
    },
    {
      title: '结算账户',
      step: 2,
      items: [
        { label: '结算账户类型', key: 'accountType' },
        { label: '开户名称', key: 'accountName' },
        { label: '银行卡号', key: 'bankCardNo' },
        { label: '开户银行', key: 'bankName' },
        { label: '开户支行', key: 'branchName' },
        { label: '联行号', key: 'bankCode' }
      ]
    },
    {
      title: '结算与发票',
      step: 3,
      items: [
        { label: '结算周期', key: 'settleCycle' },
        { label: '结算费率', key: 'feeRate' },
        { label: '最低结算金额', key: 'minSettleAmount' },
        { label: '风控保证金', key: 'deposit' },
        { label: '是否自动提现', key: 'autoWithdraw' },
        ...(form.autoWithdraw ? [{ label: '提现预留手机号', key: 'withdrawPhone' }] : []),
        { label: '发票类型', key: 'invoiceType' },
        ...(form.invoiceType && form.invoiceType !== 'NONE'
          ? [
              { label: '发票抬头', key: 'invoiceTitle' },
              { label: '纳税人识别号', key: 'taxNo' }
            ]
          : []),
        { label: '备注', key: 'remark' }
      ]
    }
  ]
  return groups
})

function displayValue(key) {
  const v = form[key]
  if (OPTION_LABELS[key]) {
    const found = OPTION_LABELS[key].find((o) => o.value === v)
    return found ? found.label : '—'
  }
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (v === '' || v === null || v === undefined) return '—'
  if (key === 'feeRate') return `${v} %`
  if (key === 'minSettleAmount' || key === 'deposit') return `¥ ${Number(v).toLocaleString()}`
  if (key === 'bankCardNo') return cardFormatter(v)
  return v
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px 16px;
  box-sizing: border-box;
}
.page-card {
  max-width: 960px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 24px 32px 16px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}
.page-header p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #909399;
}
.steps {
  margin: 24px 0 32px;
}
.step-clickable {
  cursor: pointer;
}
.form-body {
  min-height: 320px;
}
.form-body :deep(.el-select),
.form-body :deep(.el-input-number) {
  width: 100%;
}
.step-alert {
  margin-bottom: 20px;
}
.review-group {
  margin-bottom: 20px;
}
.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.review-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.review :deep(.review-label) {
  width: 140px;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  margin-top: 8px;
  padding: 16px 0 8px;
}
.draft-tip {
  font-size: 12px;
  color: #909399;
}
</style>
