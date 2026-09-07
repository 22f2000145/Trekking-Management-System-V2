export default {
    template: `
    <div class="tk-profile-page">
        <div class="tk-profile-card">
            <!-- Header -->
            <div class="tk-auth-header">
                <div class="tk-auth-icon">👤</div>
                <h1 class="tk-auth-title">Edit Profile</h1>
                <p class="tk-auth-subtitle">Update your trekker account details</p>
            </div>
            <div class="tk-auth-body">
                <div class="tk-auth-success" v-if="message">✅ {{ message }}</div>
                <div class="tk-auth-error" v-if="error">⚠️ {{ error }}</div>

                <div class="tk-form-group">
                    <label class="tk-label" for="profile-username">👤 Username</label>
                    <input
                        type="text"
                        id="profile-username"
                        class="tk-input"
                        v-model="profileData.username"
                        placeholder="Your username"
                    >
                </div>

                <div class="tk-form-group">
                    <label class="tk-label" for="profile-email">📧 Email Address</label>
                    <input
                        type="email"
                        id="profile-email"
                        class="tk-input"
                        v-model="profileData.email"
                        placeholder="Your email"
                    >
                </div>

                <div class="tk-form-group">
                    <label class="tk-label" for="profile-password">🔒 New Password</label>
                    <input
                        type="password"
                        id="profile-password"
                        class="tk-input"
                        v-model="profileData.password"
                        placeholder="Leave blank to keep current password"
                    >
                </div>

                <div style="display:flex;gap:12px;margin-top:0.5rem;">
                    <button @click="goBack" class="tk-btn tk-btn-ghost-green" style="flex:1;justify-content:center;">
                        ← Back
                    </button>
                    <button @click="saveProfile" class="tk-btn tk-btn-primary" :disabled="isLoading" style="flex:2;justify-content:center;">
                        <span v-if="isLoading" class="tk-spinner" style="margin-right:8px;"></span>
                        {{ isLoading ? 'Saving...' : '💾 Save Changes' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            message: "",
            error: "",
            isLoading: false,
            profileData: {
                username: "",
                email: "",
                password: ""
            }
        }
    },
    mounted() {
        this.fetchProfile();
    },
    methods: {
        fetchProfile() {
            fetch('/api/user/profile', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth-token")
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.username) {
                        this.profileData.username = data.username;
                        this.profileData.email = data.email;
                    } else {
                        this.error = data.message || "Failed to load profile details.";
                    }
                })
                .catch(err => {
                    this.error = "An error occurred while fetching details.";
                });
        },
        saveProfile() {
            this.message = "";
            this.error = "";
            this.isLoading = true;

            fetch('/api/user/profile', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth-token")
                },
                body: JSON.stringify(this.profileData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message === "Profile updated successfully") {
                        this.message = data.message;
                        localStorage.setItem("username", this.profileData.username);
                        this.profileData.password = "";
                        setTimeout(() => {
                            this.goBack();
                        }, 1200);
                    } else {
                        this.error = data.message || "Failed to update profile.";
                    }
                })
                .catch(err => {
                    this.error = "An error occurred during update.";
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        goBack() {
            const role = localStorage.getItem("role") || "";
            if (role.includes("admin")) {
                this.$router.push("/admin");
            } else {
                this.$router.push("/dashboard");
            }
        }
    }
}
