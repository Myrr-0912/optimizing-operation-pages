<template>
  <div class="scenario-bar">
    <span class="scenario-label">演示状态</span>
    <el-radio-group :model-value="modelValue" size="small" @update:model-value="$emit('update:modelValue', $event)">
      <el-radio-button value="normal">正常</el-radio-button>
      <el-radio-button value="loading">加载中</el-radio-button>
      <el-radio-button value="empty">新建(空)</el-radio-button>
      <el-radio-button value="error">加载失败</el-radio-button>
      <el-radio-button value="success">提交成功</el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.scenario-bar {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color);
  box-shadow: var(--el-box-shadow-light);
}
.scenario-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
</style>
