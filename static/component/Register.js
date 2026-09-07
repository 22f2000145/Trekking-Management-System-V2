export default {
template: `
<div class="tk-auth-page">
    <div class="tk-auth-card">
        <div class="tk-auth-header">
            <div class="tk-auth-icon">🏔️</div>
            <h1 class="tk-auth-title">Join TrekKaro</h1>
            <p class="tk-auth-subtitle">Create your account and start exploring</p>
        </div>
        <div class="tk-auth-body">
            <div class="tk-auth-error" v-if="message && (message.includes('already') || message.includes('missing') || message.includes('error') || message.includes('Fields'))">
                ⚠️ {{ message }}
            </div>
            <div class="tk-auth-success" v-if="message && !message.includes('already') && !message.includes('missing') && !message.includes('error') && !message.includes('Fields')">
                ✅ {{ message }}
            </div>

            <div class="tk-form-group">
                <label class="tk-label" for="reg-username">👤 Username</label>
                <input
                    type="text"
                    id="reg-username"
                    class="tk-input"
                    placeholder="Choose a username"
                    v-model="formData.username"
                >
            </div>

            <div class="tk-form-group">
                <label class="tk-label" for="reg-email">📧 Email Address</label>
                <input
                    type="email"
                    id="reg-email"
                    class="tk-input"
                    placeholder="Enter your email"
                    v-model="formData.email"
                >
            </div>

            <div class="tk-form-group">
                <label class="tk-label" for="reg-password">🔒 Password</label>
                <input
                    type="password"
                    id="reg-password"
                    class="tk-input"
                    placeholder="Create a secure password"
                    v-model="formData.password"
                    @keyup.enter="registerUser"
                >
            </div>

            <button class="tk-btn tk-btn-gold" @click="registerUser" :disabled="isLoading" style="width:100%;justify-content:center;margin-top:0.5rem;">
                <span v-if="isLoading" class="tk-spinner tk-spinner-dark" style="margin-right:8px;"></span>
                {{ isLoading ? 'Creating Account...' : '🚀 Create Account' }}
            </button>

            <div style="text-align:center;margin-top:1.5rem;font-size:0.875rem;color:var(--text-muted);">
                Already have an account? &nbsp;
                <router-link to="/login" style="color:var(--forest-light);font-weight:600;text-decoration:none;">
                    Sign in →
                </router-link>
            </div>
        </div>
    </div>
</div>
`,
data() {
    return {
        message: '',
        isLoading: false,
        formData: {
            username: '',
            email: '',
            password: ''
        }
    }
},
methods: {
    registerUser() {
        if (!this.formData.username || !this.formData.email || !this.formData.password) {
            this.message = "Please fill in all required fields"
            return
        }
        this.isLoading = true
        this.message = ""

        const payload = {
            username: this.formData.username,
            email: this.formData.email,
            password: this.formData.password,
            roles: ["user"]
        }
        fetch('/api/register', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                this.message = data.message
                if (data.message && data.message.includes("successfully")) {
                    setTimeout(() => {
                        this.$router.push('/login')
                    }, 1200)
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
