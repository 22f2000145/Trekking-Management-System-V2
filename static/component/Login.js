export default {
    template: `
    <div class="tk-auth-page">
        <div class="tk-auth-card">
            <div class="tk-auth-header">
                <div class="tk-auth-icon">🔑</div>
                <h1 class="tk-auth-title">Welcome Back</h1>
                <p class="tk-auth-subtitle">Sign in to continue your trekking journey</p>
            </div>
            <div class="tk-auth-body">
                <div class="tk-auth-error" v-if="message">
                    ⚠️ {{ message }}
                </div>

                <div class="tk-form-group">
                    <label class="tk-label" for="login-email">📧 Email Address</label>
                    <input
                        type="email"
                        id="login-email"
                        class="tk-input"
                        placeholder="name@example.com"
                        v-model="formData.email"
                        @keyup.enter="loginUser"
                    >
                </div>

                <div class="tk-form-group">
                    <label class="tk-label" for="login-password">🔒 Password</label>
                    <input
                        type="password"
                        id="login-password"
                        class="tk-input"
                        placeholder="Enter your password"
                        v-model="formData.password"
                        @keyup.enter="loginUser"
                    >
                </div>

                <button class="tk-btn tk-btn-primary w-100 mt-2" @click="loginUser" :disabled="isLoading" style="width:100%;justify-content:center;">
                    <span v-if="isLoading" class="tk-spinner" style="margin-right:8px;"></span>
                    {{ isLoading ? 'Signing In...' : '🚀 Sign In' }}
                </button>

                <div style="text-align:center;margin-top:1.5rem;font-size:0.875rem;color:var(--text-muted);">
                    New to TrekKaro? &nbsp;
                    <router-link to="/register" style="color:var(--forest-light);font-weight:600;text-decoration:none;">
                        Create an account →
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            message: "",
            isLoading: false,
            formData: {
                email: "",
                password: ""
            }
        }
    },
    methods: {
        loginUser() {
            if (!this.formData.email || !this.formData.password) {
                this.message = "Please provide email and password"
                return
            }
            this.isLoading = true
            this.message = ""

            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        localStorage.setItem('auth-token', data.token)
                        localStorage.setItem("username", data.username)
                        localStorage.setItem("role", JSON.stringify(data.roles))

                        const redirect = this.$route.query.redirect
                        if (redirect && !redirect.includes('login') && !redirect.includes('register')) {
                            this.$router.push(redirect)
                        } else if (data.roles && data.roles.includes("admin")) {
                            this.$router.push('/admin')
                        } else {
                            this.$router.push('/dashboard')
                        }
                    } else {
                        this.message = data.message || "Invalid credentials"
                    }
                })
                .catch(() => {
                    this.message = "Connection error. Please try again."
                })
                .finally(() => {
                    this.isLoading = false
                })
        }
    }
}
