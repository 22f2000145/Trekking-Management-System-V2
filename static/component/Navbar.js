export default {
    template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center py-2 px-3 border-bottom bg-white">
        <router-link class="text-decoration-none fw-bold text-success fs-4" to="/">TrekKaro</router-link>
        <div class="d-flex gap-3">
            <router-link class="text-decoration-none text-dark fw-semibold" v-if="isLoggedIn && (role && !role.includes('admin'))" to="/dashboard"></router-link>
            <router-link class="text-decoration-none text-dark fw-semibold" v-if="isLoggedIn && (role && role.includes('admin'))" to="/admin"></router-link>
        </div>
        <div class="d-flex gap-2">
            <template v-if="!isLoggedIn">
                <router-link to="/login" class="btn btn-outline-success px-3 btn-sm">Login</router-link>
                <router-link to="/register" class="btn btn-outline-success px-3 btn-sm">Register</router-link>
            </template>
            <template v-else>
                <router-link to="/update" class="btn btn-outline-primary px-3 btn-sm me-2">Profile</router-link>
                <button class="btn btn-outline-danger px-3 btn-sm" @click="logout">Logout</button>
            </template>
        </div>
    </div>
    `,
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('auth-token'),
            role: localStorage.getItem('role')
        }
    },
    watch: {
        '$route'() {
            this.isLoggedIn = !!localStorage.getItem('auth-token');
            this.role = localStorage.getItem('role');
        }
    },
    methods: {
        logout() {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('id');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            this.isLoggedIn = false;
            this.role = null;
            this.$router.push('/login');
        }
    }
}
