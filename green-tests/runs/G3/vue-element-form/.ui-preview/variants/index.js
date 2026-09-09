import EnterpriseDense from './enterprise-dense/Page.vue'
import ModernClean from './modern-clean/Page.vue'
import CommandCenter from './command-center/Page.vue'

export const variants = [
  { id: 'enterprise-dense', title: 'A 高密度速录', component: EnterpriseDense },
  { id: 'modern-clean', title: 'B 分步向导', component: ModernClean },
  { id: 'command-center', title: 'C 配置驾驶舱', component: CommandCenter }
]
