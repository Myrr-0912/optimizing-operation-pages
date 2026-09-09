// 在这里注册五套方案（5 个风格包各一套）。每套方案一个目录，themes/fonts 取自对应风格包 md 的候选表（第一项为默认），
// 方案样式须消费 var(--op-primary) / var(--op-font-family) 等变量。例如：
// import EnterpriseDense from './enterprise-dense/Page.vue'
// export const variants = [
//   {
//     id: 'enterprise-dense',
//     title: '企业高密度',
//     component: EnterpriseDense,
//     themes: [
//       { id: 'classic-blue', title: '经典蓝', vars: { '--op-primary': '#1677FF', '--op-primary-hover': '#4096FF', '--op-primary-active': '#0958D9', '--op-primary-soft': '#E6F4FF' } }
//     ],
//     fonts: [
//       { id: 'yahei', title: '雅黑', vars: { '--op-font-family': '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif' } }
//     ]
//   },
//   ...
// ]
export const variants = []
