<template>
  <el-select
    v-if="opts"
    v-model="model"
    :size="size"
    class="fc-full"
    :placeholder="'请选择' + label"
    clearable
  >
    <el-option v-for="o in opts" :key="o.value" :label="o.label" :value="o.value" />
  </el-select>

  <el-switch
    v-else-if="field === 'autoWithdraw'"
    v-model="model"
    inline-prompt
    active-text="开"
    inactive-text="关"
  />

  <el-input
    v-else-if="field === 'remark'"
    v-model="model"
    type="textarea"
    :rows="rows"
    maxlength="200"
    show-word-limit
    :placeholder="hint"
  />

  <el-input v-else-if="field === 'taxNo' && creditCode !== null" v-model="model" :size="size" clearable :placeholder="'请输入' + label">
    <template #append>
      <el-button :size="size" :disabled="!creditCode" @click="model = creditCode">同信用代码</el-button>
    </template>
  </el-input>

  <el-input v-else v-model="model" :size="size" clearable :placeholder="hint || '请输入' + label" />
</template>

<script setup>
import { computed } from 'vue'
import { fieldLabels, options } from './fields.js'

const props = defineProps({
  field: { type: String, required: true },
  size: { type: String, default: 'default' },
  rows: { type: Number, default: 3 },
  // 传入信用代码时，纳税人识别号输入框提供"同信用代码"一键带入
  creditCode: { type: String, default: null }
})

const model = defineModel()

const HINTS = {
  region: '如：浙江省杭州市西湖区',
  feeRate: '0-100 的数字，如 0.6',
  minSettleAmount: '单位：元',
  deposit: '单位：元',
  bankCode: '12 位数字',
  remark: '选填，如结算特殊约定（最多 200 字）'
}

const opts = computed(() => options[props.field] || null)
const label = computed(() => fieldLabels[props.field] || props.field)
const hint = computed(() => HINTS[props.field] || '')
</script>

<style scoped>
.fc-full {
  width: 100%;
}
</style>
