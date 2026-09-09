<template>
  <div style="padding: 16px; max-width: 900px">
    <h2>商户结算配置</h2>
    <el-form label-width="140px">
      <el-form-item label="商户编号">
        <el-input v-model="form.merchantNo" />
      </el-form-item>
      <el-form-item label="商户名称">
        <el-input v-model="form.merchantName" />
      </el-form-item>
      <el-form-item label="商户简称">
        <el-input v-model="form.shortName" />
      </el-form-item>
      <el-form-item label="商户类型">
        <el-select v-model="form.merchantType" style="width: 220px">
          <el-option label="企业" value="COMPANY" />
          <el-option label="个体工商户" value="INDIVIDUAL" />
          <el-option label="小微商户" value="MICRO" />
        </el-select>
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="form.creditCode" />
      </el-form-item>
      <el-form-item label="法人姓名">
        <el-input v-model="form.legalName" style="width: 220px" />
      </el-form-item>
      <el-form-item label="法人身份证号">
        <el-input v-model="form.legalIdNo" />
      </el-form-item>
      <el-form-item label="法人手机号">
        <el-input v-model="form.legalPhone" style="width: 220px" />
      </el-form-item>
      <el-form-item label="联系邮箱">
        <el-input v-model="form.contactEmail" />
      </el-form-item>
      <el-form-item label="客服电话">
        <el-input v-model="form.servicePhone" style="width: 220px" />
      </el-form-item>
      <el-form-item label="经营省市区">
        <el-input v-model="form.region" placeholder="如：浙江省杭州市西湖区" />
      </el-form-item>
      <el-form-item label="经营详细地址">
        <el-input v-model="form.address" />
      </el-form-item>
      <el-form-item label="行业类目">
        <el-select v-model="form.industry" style="width: 220px">
          <el-option label="食品生鲜" value="FOOD" />
          <el-option label="服饰箱包" value="CLOTHES" />
          <el-option label="数码家电" value="DIGITAL" />
          <el-option label="本地生活" value="LOCAL" />
        </el-select>
      </el-form-item>
      <el-form-item label="结算账户类型">
        <el-select v-model="form.accountType" style="width: 220px">
          <el-option label="对公账户" value="CORPORATE" />
          <el-option label="法人个人账户" value="PERSONAL" />
        </el-select>
      </el-form-item>
      <el-form-item label="开户名称">
        <el-input v-model="form.accountName" />
      </el-form-item>
      <el-form-item label="银行卡号">
        <el-input v-model="form.bankCardNo" />
      </el-form-item>
      <el-form-item label="开户银行">
        <el-input v-model="form.bankName" style="width: 220px" />
      </el-form-item>
      <el-form-item label="开户支行">
        <el-input v-model="form.branchName" />
      </el-form-item>
      <el-form-item label="联行号">
        <el-input v-model="form.bankCode" style="width: 220px" />
      </el-form-item>
      <el-form-item label="结算周期">
        <el-select v-model="form.settleCycle" style="width: 220px">
          <el-option label="T+1" value="T1" />
          <el-option label="T+7" value="T7" />
          <el-option label="月结" value="MONTH" />
        </el-select>
      </el-form-item>
      <el-form-item label="结算费率(%)">
        <el-input v-model="form.feeRate" style="width: 220px" />
      </el-form-item>
      <el-form-item label="最低结算金额">
        <el-input v-model="form.minSettleAmount" style="width: 220px" />
      </el-form-item>
      <el-form-item label="发票类型">
        <el-select v-model="form.invoiceType" style="width: 220px">
          <el-option label="增值税专用发票" value="SPECIAL" />
          <el-option label="增值税普通发票" value="NORMAL" />
          <el-option label="不开票" value="NONE" />
        </el-select>
      </el-form-item>
      <el-form-item label="发票抬头">
        <el-input v-model="form.invoiceTitle" />
      </el-form-item>
      <el-form-item label="纳税人识别号">
        <el-input v-model="form.taxNo" />
      </el-form-item>
      <el-form-item label="是否自动提现">
        <el-switch v-model="form.autoWithdraw" />
      </el-form-item>
      <el-form-item label="提现预留手机号">
        <el-input v-model="form.withdrawPhone" style="width: 220px" />
      </el-form-item>
      <el-form-item label="风控保证金">
        <el-input v-model="form.deposit" style="width: 220px" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">提交</el-button>
        <el-button type="danger" @click="reset">清空</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const empty = {
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
  feeRate: '0.6',
  minSettleAmount: '100',
  invoiceType: 'SPECIAL',
  invoiceTitle: '杭州云栖优选贸易有限公司',
  taxNo: '91330106MA2CE55X0K',
  autoWithdraw: true,
  withdrawPhone: '13957112288',
  deposit: '20000',
  remark: ''
}

const form = reactive({ ...empty })

function submit() {
  if (!form.merchantName) {
    window.alert('商户名称不能为空')
    return
  }
  if (!form.bankCardNo) {
    window.alert('银行卡号不能为空')
    return
  }
  if (form.feeRate && isNaN(Number(form.feeRate))) {
    window.alert('费率必须是数字')
    return
  }
  window.alert('保存成功')
}

function reset() {
  Object.keys(form).forEach((k) => {
    form[k] = typeof form[k] === 'boolean' ? false : ''
  })
}
</script>
