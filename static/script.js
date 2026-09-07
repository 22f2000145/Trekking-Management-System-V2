import Home from './component/Home.js'
import Login from './component/Login.js'
import Register from './component/Register.js?v=2'
import Navbar from './component/Navbar.js'
import Footer from './component/footer.js'
import Dashboard from './component/Dashboard.js'
import Update from './component/Update.js'
import Admin from './component/Admin.js'

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, meta: { guestOnly: true } },
    { path: '/register', component: Register, meta: { guestOnly: true } },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/update', component: Update, meta: { requiresAuth: true } },
    { path: '/admin', component: Admin, meta: { requiresAuth: true, adminOnly: true } },
    { path: '*', redirect: '/' }
]

const router = new VueRouter({
    routes,
    scrollBehavior() {
        return { x: 0, y: 0 }
    }
})

// Navigation Guards: Protect routes & handle guest redirects
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth-token')
    const roleStr = localStorage.getItem('role') || ''
    let roles = []
    try {
        roles = roleStr.startsWith('[') ? JSON.parse(roleStr) : [roleStr]
    } catch (e) {
        roles = [roleStr]
    }
    const isAdmin = roles.includes('admin')

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next({ path: '/login', query: { redirect: to.fullPath } })
            return
        }
        if (to.matched.some(record => record.meta.adminOnly) && !isAdmin) {
            next({ path: '/dashboard' })
            return
        }
    }

    if (to.matched.some(record => record.meta.guestOnly)) {
        if (token) {
            next({ path: isAdmin ? '/admin' : '/dashboard' })
            return
        }
    }

    next()
})

const app = new Vue({
    el: '#app',
    router,
    template: `
    <div>
      <nav-bar></nav-bar>
      <router-view></router-view>
      <foot></foot>
    </div>
    `,
    data: {
        section: "IITM BS DEGREE"
    },
    components: {
        "nav-bar": Navbar,
        "foot": Footer,
    }
})