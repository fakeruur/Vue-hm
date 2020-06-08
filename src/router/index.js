import Vue from 'vue'
import VueRouter from 'vue-router'


const Login = () => import('../components/Login')
const Home = () => import('../components/Home')
const Welcome = () => import('../components/Welcome')
const Users = () => import('../views/user/Users')
const Rights = () => import('../views/power/rights')
const Roles = () => import('../views/power/roles')
const Cate = () => import('../views/goods/Cate')
const Params = () => import('../views/goods/Params')
const GoodsList = () => import('../views/goods/List')
const Add = () => import('../views/goods/Add')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add }
    ]
  }
]
const router = new VueRouter({
  routes,
  mode: 'history'
})

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}


//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to将要访问的路径，from从哪个路径跳转来，next放行函数
  if (to.path === '/login') return next()
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
