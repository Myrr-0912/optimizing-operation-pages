import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import EnterpriseDense from './enterprise-dense/Page.jsx'
import ModernClean from './modern-clean/Page.jsx'
import CommandCenter from './command-center/Page.jsx'

dayjs.locale('zh-cn')

export const variants = [
  { id: 'enterprise-dense', title: 'A 企业高密度', component: EnterpriseDense },
  { id: 'modern-clean', title: 'B 现代清爽', component: ModernClean },
  { id: 'command-center', title: 'C 暗色驾驶舱', component: CommandCenter }
]
