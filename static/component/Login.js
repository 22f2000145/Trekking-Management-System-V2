export default {
    template: `
    <div class="row justify-content-center align-items-center" style="min-height: 750px;">
        <div class="col-md-4 px-4">
            <div class="card p-4 shadow-sm">
                <p class="mx-2 mt-2 text-danger text-center" v-if="message">{{message}}</p>
                <h3 class="text-center mb-4">Login</h3>
                
                <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input type="email" id="email" class="form-control" placeholder="name@example.com" v-model="formData.email">
                </div>
                
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" class="form-control" placeholder="Enter your password" v-model="formData.password">
                </div>
                
                <button class="btn btn-primary w-100 mt-2" @click="loginUser">Login</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            message: "",
            formData: {
                email: "",
                password: ""
            }
        }
    },
    methods: {
        loginUser() {
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
                        if (data.roles && data.roles.includes("admin")) {
                            this.$router.push('/admin')
                        } else {
                            this.$router.push('/dashboard')
                        }
                    } else {
                        this.message = data.message
                    }
                })
        }
    }
}
