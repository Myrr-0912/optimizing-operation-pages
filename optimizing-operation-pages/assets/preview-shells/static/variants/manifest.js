// 每套方案一个目录（variants/<id>/index.html），在此注册。
// themes/fonts 取自对应风格包 md 的候选表（第一项为默认），方案页面样式须消费 var(--op-primary) 等变量：
// window.PREVIEW_VARIANTS = [
//   {
//     id: 'enterprise-dense',
//     title: '企业高密度',
//     themes: [
//       { id: 'classic-blue', title: '经典蓝', vars: { '--op-primary': '#1677FF', '--op-primary-hover': '#4096FF', '--op-primary-active': '#0958D9', '--op-primary-soft': '#E6F4FF' } }
//     ],
//     fonts: [
//       { id: 'yahei', title: '雅黑', vars: { '--op-font-family': '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif' } }
//     ]
//   },
//   ...
// ]
window.PREVIEW_VARIANTS = []
