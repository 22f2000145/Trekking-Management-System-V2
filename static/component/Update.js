export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center mb-4">Edit Profile</h2>
        <div class="card p-4 shadow-sm mx-auto" style="max-width: 500px;">
            <div v-if="message" class="alert alert-success">{{ message }}</div>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" v-model="profileData.username">
            </div>
            
            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" class="form-control" id="email" v-model="profileData.email">
            </div>
            
            <div class="mb-3">
                <label for="password" class="form-label">New Password (leave blank to keep current)</label>
                <input type="password" class="form-control" id="password" v-model="profileData.password" placeholder="Enter new password">
            </div>
            
            <div class="d-flex justify-content-between">
                <button @click="goBack" class="btn btn-secondary">Back</button>
                <button @click="saveProfile" class="btn btn-success">Save Profile</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            message: "",
            error: "",
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
                    }, 1500);
                } else {
                    this.error = data.message || "Failed to update profile.";
                }
            })
            .catch(err => {
                this.error = "An error occurred during update.";
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
