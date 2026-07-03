
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
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/dashboard', component: Dashboard },
    { path: '/update', component: Update },
    { path: '/admin', component: Admin }
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: '#app',
    router,
    template: `
    <div class="container-fluid px-0">
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