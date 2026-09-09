<template>
  <div class="ed-page">
    <ScenarioBar v-model="scenario" />

    <header class="ed-header">
      <div class="ed-title-wrap">
        <h1 class="ed-title">商户结算配置</h1>
        <span v-if="phase === 'ready' && !isNew" class="ed-sub mono">{{ form.merchantNo }} · {{ form.merchantName || '未命名商户' }}</span>
        <el-tag v-if="phase === 'ready' && isNew" type="warning" size="small">新建商户</el-tag>
      </div>
      <div v-if="phase === 'ready'" class="ed-actions">
        <el-popconfirm
          width="300"
          title="将清空全部 29 个字段且不可恢复，确定清空？"
          confirm-button-text="确认清空"
          confirm-button-type="danger"
          cancel-button-text="取消"
          @confirm="handleClear"
        >
          <template #reference>
            <el-button size="small" plain>清空重填</el-button>
          </template>
        </el-popconfirm>
        <el-button size="small" type="primary" :loading="saving" @click="handleSubmit">保存配置</el-button>
      </div>
    </header>

    <!-- 加载态 -->
    <div v-if="phase === 'loading'" class="ed-body">
      <div class="ed-loading">
        <el-skeleton animated :rows="16" />
      </div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="phase === 'error'" class="ed-state">
      <el-result icon="error" title="结算配置加载失败" :sub-title="loadError">
        <template #extra>
          <el-button type="primary" @click="load">重试</el-button>
        </template>
      </el-result>
    </div>

    <template v-else>
      <div class="ed-alerts">
        <el-alert v-if="submitted" type="success" show-icon :closable="false">
          <template #title>
            保存成功（{{ savedInfo?.savedAt }}），新配置将从下一结算周期生效。
            <el-button link type="primary" size="small" @click="submitted = false">继续编辑</el-button>
          </template>
        </el-alert>
        <el-alert
          v-if="isNew && !submitted"
          type="info"
          show-icon
          :closable="false"
          title="新建商户：暂无结算配置，请从商户基本信息开始填写，商户名称与银行卡号为必填。"
        />
        <el-alert
          v-if="errorCount > 0"
          type="error"
          show-icon
          :closable="false"
          :title="`有 ${errorCount} 处校验未通过，已自动定位到第一处错误。`"
        />
      </div>

      <div class="ed-body">
        <aside class="ed-anchor">
          <a v-for="g in groups" :key="g.id" class="ed-anchor-link" :class="{ active: activeId === g.id }" @click="scrollTo(g.id)">
            <span>{{ g.title }}</span>
            <span class="ed-anchor-count mono">{{ countFilled(form, g.fields) }}/{{ g.fields.length }}</span>
          </a>
          <div class="ed-anchor-total">
            已填 <span class="mono">{{ totalFilled }}/29</span>
          </div>
        </aside>

        <el-form
          ref="formRef"
          class="ed-form"
          :model="form"
          :rules="formRules"
          label-width="140px"
          label-position="right"
          size="small"
          scroll-to-error
        >
          <section v-for="g in groups" :id="'ed-' + g.id" :key="g.id" class="ed-group" :class="{ risk: g.risk }">
            <div class="ed-group-head">
              <h2>{{ g.title }}</h2>
              <span class="ed-group-desc">{{ g.desc }}</span>
              <el-tag v-if="g.risk" type="danger" effect="plain" size="small">影响打款，仔细核对</el-tag>
            </div>
            <el-row :gutter="24">
              <el-col v-for="f in g.fields" :key="f" :span="f === 'remark' || f === 'address' ? 24 : 12">
                <el-form-item :prop="f" :label="fieldLabels[f]">
                  <FieldControl v-model="form[f]" :field="f" size="small" :rows="2" :credit-code="f === 'taxNo' ? form.creditCode : null" />
                </el-form-item>
              </el-col>
            </el-row>
          </section>

          <div class="ed-footer">
            <el-button size="small" type="primary" :loading="saving" @click="handleSubmit">保存配置</el-button>
            <span class="ed-footer-hint">共 29 项 · 必填 2 项（商户名称、银行卡号）</span>
          </div>
        </el-form>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import ScenarioBar from '../../shared/ScenarioBar.vue'
import FieldControl from '../../shared/FieldControl.vue'
import { useSettlement } from '../../shared/useSettlement.js'
import { countFilled, fieldLabels, formRules, groups } from '../../shared/fields.js'

const { scenario, phase, submitted, isNew, saving, loadError, savedInfo, form, load, save, clearAll } = useSettlement()

const formRef = ref()
const errorCount = ref(0)
const activeId = ref(groups[0].id)

const totalFilled = computed(() => countFilled(form, groups.flatMap((g) => g.fields)))

function scrollTo(id) {
  activeId.value = id
  document.getElementById('ed-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleClear() {
  clearAll()
  errorCount.value = 0
  submitted.value = false
  formRef.value?.clearValidate()
  ElMessage.info('已清空，全部字段待填写')
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    errorCount.value = 0
    await save()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (invalid) {
    if (invalid && typeof invalid === 'object') {
      errorCount.value = Object.keys(invalid).length
    }
  }
}
</script>

<style scoped>
.ed-page {
  min-height: 100vh;
  background: #f2f3f5;
  font-size: 13px;
  color: #303133;
  padding-bottom: 48px;
}
.mono {
  font-family: 'JetBrains Mono', Consolas, Menlo, monospace;
}
.ed-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
}
.ed-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.ed-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.ed-sub {
  font-size: 12px;
  color: #909399;
}
.ed-actions {
  display: flex;
  gap: 8px;
}
.ed-alerts {
  max-width: 1080px;
  margin: 12px auto 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ed-body {
  display: flex;
  gap: 12px;
  max-width: 1080px;
  margin: 12px auto 0;
  padding: 0 24px;
  align-items: flex-start;
}
.ed-loading {
  flex: 1;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 24px;
}
.ed-state {
  max-width: 1080px;
  margin: 48px auto 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
}
.ed-anchor {
  position: sticky;
  top: 64px;
  width: 168px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 6px 0;
}
.ed-anchor-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.ed-anchor-link:hover {
  background: #f5f7fa;
}
.ed-anchor-link.active {
  color: var(--el-color-primary);
  border-left-color: var(--el-color-primary);
  background: #ecf5ff;
}
.ed-anchor-count {
  font-size: 11px;
  color: #909399;
}
.ed-anchor-total {
  border-top: 1px solid #ebeef5;
  margin-top: 4px;
  padding: 8px 12px 2px;
  font-size: 12px;
  color: #909399;
}
.ed-form {
  flex: 1;
  min-width: 0;
}
.ed-group {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 12px 20px 2px;
  margin-bottom: 12px;
  scroll-margin-top: 60px;
}
.ed-group.risk {
  border-left: 3px solid var(--el-color-danger);
}
.ed-group-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}
.ed-group-head h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.ed-group-desc {
  font-size: 12px;
  color: #909399;
  flex: 1;
}
.ed-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
}
.ed-footer-hint {
  font-size: 12px;
  color: #909399;
}
:deep(.el-form-item) {
  margin-bottom: 14px;
}
:deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
}
</style>
