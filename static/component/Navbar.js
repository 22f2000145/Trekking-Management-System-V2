export default {
    template: `
    <nav class="tk-navbar">
        <router-link class="tk-navbar-brand" to="/">
            <div class="tk-brand-icon">🏔️</div>
            <div>
                <div class="tk-brand-name">TrekKaro</div>
                <span class="tk-brand-tagline">Adventure Awaits</span>
            </div>
        </router-link>

        <div class="tk-nav-links">
            <template v-if="!isLoggedIn">
                <router-link to="/login" class="tk-nav-link tk-nav-link-outline">
                    🔑 Login
                </router-link>
                <router-link to="/register" class="tk-nav-link tk-nav-link-primary">
                    🚀 Get Started
                </router-link>
            </template>
            <template v-else>
                <!-- User Chip -->
                <div class="tk-user-chip" :title="'Logged in as ' + username">
                    <div class="tk-user-avatar">{{ (username || 'T').charAt(0).toUpperCase() }}</div>
                    <span>{{ username }}</span>
                    <span class="tk-badge" :class="roleBadgeClass" style="font-size:0.65rem;padding:2px 7px;">
                        {{ roleLabel }}
                    </span>
                </div>

                <router-link
                    v-if="isAdmin"
                    to="/admin"
                    class="tk-nav-link tk-nav-link-ghost"
                >
                    🛡️ Admin
                </router-link>
                <router-link
                    v-if="!isAdmin && !isStaff"
                    to="/dashboard"
                    class="tk-nav-link tk-nav-link-ghost"
                >
                    🏕️ Dashboard
                </router-link>
                <router-link
                    v-if="isStaff"
                    to="/dashboard"
                    class="tk-nav-link tk-nav-link-ghost"
                >
                    🗺️ Guide Panel
                </router-link>
                <router-link
                    v-if="!isStaff"
                    to="/update"
                    class="tk-nav-link tk-nav-link-ghost"
                >
                    👤 Profile
                </router-link>
                <button class="tk-nav-link tk-nav-link-danger" @click="logout">
                    ← Logout
                </button>
            </template>
        </div>
    </nav>
    `,
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('auth-token'),
            username: localStorage.getItem('username') || '',
            role: localStorage.getItem('role') || ''
        }
    },
    computed: {
        isAdmin() {
            return this.role && this.role.includes('admin')
        },
        isStaff() {
            return this.role && this.role.includes('staff')
        },
        roleLabel() {
            if (this.isAdmin) return 'Admin'
            if (this.isStaff) return 'Guide'
            return 'Trekker'
        },
        roleBadgeClass() {
            if (this.isAdmin) return 'tk-badge-danger'
            if (this.isStaff) return 'tk-badge-sky'
            return 'tk-badge-success'
        }
    },
    watch: {
        '$route'() {
            this.syncUser()
        }
    },
    mounted() {
        this.syncUser()
    },
    methods: {
        syncUser() {
            this.isLoggedIn = !!localStorage.getItem('auth-token')
            this.username = localStorage.getItem('username') || ''
            this.role = localStorage.getItem('role') || ''
        },
        logout() {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('id')
            localStorage.removeItem('username')
            localStorage.removeItem('role')
            this.isLoggedIn = false
            this.username = ''
            this.role = ''
            this.$router.push('/login')
        }
    }
}
